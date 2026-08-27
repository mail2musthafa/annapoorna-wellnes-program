"""Authentication Schemas."""

from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, description="Password with at least 8 characters")
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    terms_accepted: bool = Field(default=True)


class UserLoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: "UserSummaryResponse"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserSummaryResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    roles: list[str]
    permissions: list[str]
    avatar_url: str | None = None
