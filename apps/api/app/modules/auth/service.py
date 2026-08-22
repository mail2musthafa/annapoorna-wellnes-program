"""Authentication Service handling registration, login, and token generation."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.constants import RoleName
from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.modules.auth.schemas import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserSummaryResponse,
)
from app.modules.roles.models import Role, UserRole
from app.modules.users.models import ConsentRecord, User, UserProfile


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, req: UserRegisterRequest, ip_address: str | None = None) -> TokenResponse:
        # Check if user already exists
        existing = await self.db.execute(select(User).where(User.email == req.email))
        if existing.scalar_one_or_none():
            raise ConflictException(f"An account with email '{req.email}' already exists.")

        # Create user
        user = User(
            email=req.email,
            hashed_password=get_password_hash(req.password),
            is_email_verified=False,
        )
        self.db.add(user)
        await self.db.flush()

        # Create user profile
        profile = UserProfile(
            user_id=user.id,
            first_name=req.first_name,
            last_name=req.last_name,
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
        member_role_query = await self.db.execute(select(Role).where(Role.name == RoleName.MEMBER))
        member_role = member_role_query.scalar_one_or_none()
        if member_role:
            user_role = UserRole(user_id=user.id, role_id=member_role.id)
            self.db.add(user_role)

        await self.db.commit()

        return await self._generate_token_response(user.id)

    async def login(self, req: UserLoginRequest, ip_address: str | None = None, user_agent: str | None = None) -> TokenResponse:
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.profile),
                selectinload(User.roles).selectinload(Role.permissions),
            )
            .where(User.email == req.email, User.is_deleted.is_(False))
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(req.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        return await self._generate_token_response(user.id, ip_address=ip_address, user_agent=user_agent)

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

        user_summary = UserSummaryResponse(
            id=str(user.id),
            email=user.email,
            first_name=first_name,
            last_name=last_name,
            roles=roles,
            permissions=permissions,
            avatar_url=avatar_url,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_summary,
        )
