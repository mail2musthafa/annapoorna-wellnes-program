"""Authentication Router."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.schemas import (
    OAuthLoginRequest,
    OTPResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    PhoneSendOTPRequest,
    PhoneVerifyOTPRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
)
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new member account with extended onboarding details",
)
async def register(
    req: UserRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    client_ip = request.client.host if request.client else None
    return await service.register(req, ip_address=client_ip)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate via Email or Phone and receive tokens",
)
async def login(
    req: UserLoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")
    return await service.login(req, ip_address=client_ip, user_agent=user_agent)


@router.post(
    "/otp/send",
    response_model=OTPResponse,
    status_code=status.HTTP_200_OK,
    summary="Dispatch a 6-digit OTP code to mobile phone via WhatsApp or SMS",
)
async def send_otp(
    req: PhoneSendOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.send_phone_otp(req)


@router.post(
    "/otp/verify",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify mobile OTP and authenticate or auto-register user",
)
async def verify_otp(
    req: PhoneVerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.verify_phone_otp(req)


@router.post(
    "/oauth",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate or register user via Google or Apple OAuth",
)
async def oauth_login(
    req: OAuthLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.oauth_login_or_register(req)


@router.post(
    "/password-reset/request",
    status_code=status.HTTP_200_OK,
    summary="Request a password reset link/token or mobile OTP code",
)
async def request_password_reset(
    req: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.request_password_reset(req)


@router.post(
    "/password-reset/confirm",
    status_code=status.HTTP_200_OK,
    summary="Confirm password reset using verification token/OTP and new password",
)
async def confirm_password_reset(
    req: PasswordResetConfirmRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.confirm_password_reset(req)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token using valid refresh token",
)
async def refresh_tokens(
    req: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.refresh_tokens(req.refresh_token)
