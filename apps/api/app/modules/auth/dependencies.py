"""Authentication dependencies for FastAPI route handlers."""

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import UnauthorizedException
from app.core.permissions import UserContext
from app.core.security import decode_token

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user_context(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> UserContext:
    if not credentials or not credentials.credentials:
        raise UnauthorizedException("Missing authentication token.")

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise UnauthorizedException("Invalid token type.")
        user_id = payload.get("sub")
        roles = payload.get("roles", [])
        permissions = payload.get("permissions", [])
        if not user_id:
            raise UnauthorizedException("Invalid token subject.")
        return UserContext(user_id=user_id, email="", roles=roles, permissions=permissions)
    except Exception as e:
        raise UnauthorizedException("Invalid or expired access token.") from e


async def get_optional_user_context(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> UserContext | None:
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        roles = payload.get("roles", [])
        permissions = payload.get("permissions", [])
        return UserContext(user_id=user_id, email="", roles=roles, permissions=permissions)
    except Exception:
        return None
