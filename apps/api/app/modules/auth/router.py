"""Authentication Router."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.schemas import (
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
    summary="Register a new member account",
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
    summary="Authenticate and receive access/refresh tokens",
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
