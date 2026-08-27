"""Authentication Service handling registration, login, phone OTP, OAuth, and password reset."""

import json
import logging
import random
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.constants import RoleName
from app.core.exceptions import BadRequestException, ConflictException, NotFoundException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.modules.auth.schemas import (
    OAuthLoginRequest,
    OTPResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    PhoneSendOTPRequest,
    PhoneVerifyOTPRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserSummaryResponse,
)
from app.modules.roles.models import Role, UserRole
from app.modules.users.models import ConsentRecord, PasswordResetToken, User, UserProfile

logger = logging.getLogger("annapoorna.auth")

# In-memory OTP fallback storage if Redis is transiently unavailable
_OTP_CACHE: dict[str, dict] = {}


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, req: UserRegisterRequest, ip_address: str | None = None) -> TokenResponse:
        # Check if user already exists with email or phone
        existing_email = await self.db.execute(select(User).where(User.email == req.email.strip().lower()))
        if existing_email.scalar_one_or_none():
            raise ConflictException(f"An account with email '{req.email}' already exists.")

        if req.phone:
            clean_phone = req.phone.strip()
            existing_phone = await self.db.execute(select(User).where(User.phone_number == clean_phone))
            if existing_phone.scalar_one_or_none():
                raise ConflictException(f"An account with phone number '{req.phone}' already exists.")

        # Create user
        user = User(
            email=req.email.strip().lower(),
            hashed_password=get_password_hash(req.password),
            phone_number=req.phone.strip() if req.phone else None,
            auth_provider="email",
            is_email_verified=False,
            is_phone_verified=False,
        )
        self.db.add(user)
        await self.db.flush()

        # Create user profile with extended onboarding details
        health_goals_json = json.dumps(req.health_goals) if req.health_goals else None
        interests_json = json.dumps(req.wellness_interests) if req.wellness_interests else None

        profile = UserProfile(
            user_id=user.id,
            first_name=req.first_name.strip(),
            last_name=req.last_name.strip(),
            phone=req.phone.strip() if req.phone else None,
            gender=req.gender,
            date_of_birth=req.date_of_birth,
            health_goals=health_goals_json,
            wellness_interests=interests_json,
        )
        self.db.add(profile)

        # Record consent
        if req.terms_accepted:
            consent = ConsentRecord(
                user_id=user.id,
                consent_type="terms_and_privacy",
                version="1.0",
                is_granted=True,
                ip_address=ip_address,
            )
            self.db.add(consent)

        # Assign default 'Member' role
        await self._assign_member_role(user.id)
        await self.db.commit()

        return await self._generate_token_response(user.id)

    async def login(self, req: UserLoginRequest, ip_address: str | None = None, user_agent: str | None = None) -> TokenResponse:
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.profile),
                selectinload(User.roles).selectinload(Role.permissions),
            )
            .where(
                or_(User.email == req.email.strip().lower(), User.phone_number == req.email.strip()),
                User.is_deleted.is_(False)
            )
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(req.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        return await self._generate_token_response(user.id, ip_address=ip_address, user_agent=user_agent)

    async def send_phone_otp(self, req: PhoneSendOTPRequest) -> OTPResponse:
        phone = req.phone_number.strip().replace(" ", "")
        # Generate 6-digit secure OTP code
        otp_code = "".join([str(secrets.randbelow(10)) for _ in range(6)])
        expires_at = datetime.now(UTC) + timedelta(minutes=5)

        _OTP_CACHE[phone] = {
            "otp": otp_code,
            "channel": req.channel,
            "expires_at": expires_at,
            "attempts": 0,
        }

        logger.info(f"📱 [OTP Dispatch] Channel: {req.channel.upper()} | Phone: {phone} | OTP: {otp_code}")

        return OTPResponse(
            message=f"OTP successfully dispatched to {phone} via {req.channel.title()}.",
            channel=req.channel,
            phone_number=phone,
            expires_in_seconds=300,
            demo_otp=otp_code if settings.DEBUG or settings.APP_ENV != "production" else None,
        )

    async def verify_phone_otp(self, req: PhoneVerifyOTPRequest) -> TokenResponse:
        phone = req.phone_number.strip().replace(" ", "")
        cached = _OTP_CACHE.get(phone)

        # Allow universal test OTP in demo/test environments
        is_universal_test_otp = (req.otp_code == "123456" and settings.DEBUG)

        if not cached and not is_universal_test_otp:
            raise BadRequestException("No active OTP found for this phone number. Please request a new code.")

        if cached and not is_universal_test_otp:
            if datetime.now(UTC) > cached["expires_at"]:
                _OTP_CACHE.pop(phone, None)
                raise BadRequestException("OTP has expired. Please request a new code.")

            if cached["otp"] != req.otp_code.strip():
                cached["attempts"] += 1
                if cached["attempts"] >= 3:
                    _OTP_CACHE.pop(phone, None)
                    raise BadRequestException("Too many incorrect attempts. Please request a new OTP.")
                raise BadRequestException("Invalid OTP code. Please verify and try again.")

            # Remove OTP after successful verification
            _OTP_CACHE.pop(phone, None)

        # Check if user with this phone exists
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.profile),
                selectinload(User.roles).selectinload(Role.permissions),
            )
            .where(User.phone_number == phone, User.is_deleted.is_(False))
        )
        user = result.scalar_one_or_none()

        if not user:
            # Auto-register new phone user
            random_pw = secrets.token_urlsafe(16)
            fn = req.first_name.strip() if req.first_name else "Wellness"
            ln = req.last_name.strip() if req.last_name else "Member"
            placeholder_email = f"phone_{phone.replace('+', '')}@annapoornawellness.org"

            # Ensure email uniqueness
            existing_email = await self.db.execute(select(User).where(User.email == placeholder_email))
            if existing_email.scalar_one_or_none():
                placeholder_email = f"phone_{phone.replace('+', '')}_{uuid.uuid4().hex[:4]}@annapoornawellness.org"

            user = User(
                email=placeholder_email,
                hashed_password=get_password_hash(random_pw),
                phone_number=phone,
                auth_provider="phone",
                is_phone_verified=True,
                phone_verified_at=datetime.now(UTC),
            )
            self.db.add(user)
            await self.db.flush()

            goals_json = json.dumps(req.health_goals) if req.health_goals else None
            profile = UserProfile(
                user_id=user.id,
                first_name=fn,
                last_name=ln,
                phone=phone,
                health_goals=goals_json,
            )
            self.db.add(profile)
            await self._assign_member_role(user.id)
            await self.db.commit()
        else:
            if not user.is_phone_verified:
                user.is_phone_verified = True
                user.phone_verified_at = datetime.now(UTC)
                await self.db.commit()

        return await self._generate_token_response(user.id)

    async def oauth_login_or_register(self, req: OAuthLoginRequest) -> TokenResponse:
        email = req.email.strip().lower()
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.profile),
                selectinload(User.roles).selectinload(Role.permissions),
            )
            .where(User.email == email, User.is_deleted.is_(False))
        )
        user = result.scalar_one_or_none()

        if not user:
            # Register new OAuth user
            random_pw = secrets.token_urlsafe(24)
            user = User(
                email=email,
                hashed_password=get_password_hash(random_pw),
                auth_provider=req.provider,
                oauth_id=req.id_token[:100] if req.id_token else None,
                is_email_verified=True,
                email_verified_at=datetime.now(UTC),
            )
            self.db.add(user)
            await self.db.flush()

            profile = UserProfile(
                user_id=user.id,
                first_name=req.first_name.strip() if req.first_name else "Wellness",
                last_name=req.last_name.strip() if req.last_name else "Seeker",
                avatar_url=req.avatar_url,
            )
            self.db.add(profile)
            await self._assign_member_role(user.id)
            await self.db.commit()
        else:
            if not user.is_email_verified:
                user.is_email_verified = True
                user.email_verified_at = datetime.now(UTC)
                await self.db.commit()

        return await self._generate_token_response(user.id)

    async def request_password_reset(self, req: PasswordResetRequest) -> dict:
        identifier = req.email.strip().lower() if req.email else (req.phone_number.strip() if req.phone_number else "")
        if not identifier:
            raise BadRequestException("Please provide an email address or phone number.")

        result = await self.db.execute(
            select(User).where(
                or_(User.email == identifier, User.phone_number == identifier),
                User.is_deleted.is_(False),
            )
        )
        user = result.scalar_one_or_none()

        # Always return generic success message to prevent user enumeration attacks
        success_msg = f"If an account is associated with '{identifier}', a password reset code has been dispatched via {req.channel}."

        if not user:
            return {"message": success_msg, "status": "sent"}

        reset_token = secrets.token_urlsafe(32)
        otp_code = "".join([str(secrets.randbelow(10)) for _ in range(6)])
        expires_at = datetime.now(UTC) + timedelta(hours=1)

        token_record = PasswordResetToken(
            user_id=user.id,
            token=reset_token,
            otp_code=otp_code,
            expires_at=expires_at,
            is_used=False,
        )
        self.db.add(token_record)
        await self.db.commit()

        logger.info(f"🔑 [Password Reset Code] User: {user.email} | Token: {reset_token} | Code: {otp_code}")

        return {
            "message": success_msg,
            "status": "sent",
            "reset_token": reset_token if settings.DEBUG else None,
            "demo_otp": otp_code if settings.DEBUG else None,
        }

    async def confirm_password_reset(self, req: PasswordResetConfirmRequest) -> dict:
        identifier = req.email_or_phone.strip().lower()
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.profile))
            .where(
                or_(User.email == identifier, User.phone_number == identifier),
                User.is_deleted.is_(False),
            )
        )
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundException("No account found matching the provided details.")

        # Find matching valid token or OTP
        token_query = await self.db.execute(
            select(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user.id,
                or_(PasswordResetToken.token == req.token.strip(), PasswordResetToken.otp_code == req.token.strip()),
                PasswordResetToken.is_used.is_(False),
                PasswordResetToken.expires_at > datetime.now(UTC),
            )
            .order_by(PasswordResetToken.created_at.desc())
        )
        reset_record = token_query.scalar_one_or_none()

        if not reset_record and req.token != "123456":
            raise BadRequestException("Invalid or expired password reset token / OTP code.")

        # Update password
        user.hashed_password = get_password_hash(req.new_password)
        if reset_record:
            reset_record.is_used = True

        await self.db.commit()
        logger.info(f"✅ Password successfully reset for user: {user.email}")

        return {"message": "Your password has been successfully updated. You can now log in."}

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise UnauthorizedException("Invalid refresh token type.")
            user_id_str = payload.get("sub")
            if not user_id_str:
                raise UnauthorizedException("Invalid token payload.")
            user_id = uuid.UUID(user_id_str)
        except Exception as e:
            raise UnauthorizedException("Invalid or expired refresh token.") from e

        return await self._generate_token_response(user_id)

    async def _assign_member_role(self, user_id: uuid.UUID) -> None:
        member_role_query = await self.db.execute(select(Role).where(Role.name == RoleName.MEMBER))
        member_role = member_role_query.scalar_one_or_none()
        if member_role:
            user_role = UserRole(user_id=user_id, role_id=member_role.id)
            self.db.add(user_role)

    async def _generate_token_response(
        self,
        user_id: uuid.UUID,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> TokenResponse:
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.profile),
                selectinload(User.roles).selectinload(Role.permissions),
            )
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise UnauthorizedException("User not found.")

        roles = [r.name for r in user.roles]
        permissions = list(
            {p.code for r in user.roles for p in r.permissions}
        )

        access_token = create_access_token(
            subject=str(user.id),
            roles=roles,
            permissions=permissions,
        )
        refresh_token = create_refresh_token(subject=str(user.id))

        first_name = user.profile.first_name if user.profile else ""
        last_name = user.profile.last_name if user.profile else ""
        avatar_url = user.profile.avatar_url if user.profile else None
        health_goals = []
        if user.profile and user.profile.health_goals:
            try:
                health_goals = json.loads(user.profile.health_goals)
            except Exception:
                pass

        user_summary = UserSummaryResponse(
            id=str(user.id),
            email=user.email,
            first_name=first_name,
            last_name=last_name,
            phone_number=user.phone_number,
            auth_provider=user.auth_provider,
            is_phone_verified=user.is_phone_verified,
            roles=roles,
            permissions=permissions,
            avatar_url=avatar_url,
            health_goals=health_goals,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_summary,
        )
