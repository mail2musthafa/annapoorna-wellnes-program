"""Authentication Schemas."""

from typing import Literal
from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, description="Password with at least 8 characters")
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    gender: str | None = Field(default=None, max_length=30)
    date_of_birth: str | None = Field(default=None, max_length=30)
    health_goals: list[str] | None = Field(default=None)
    wellness_interests: list[str] | None = Field(default=None)
    terms_accepted: bool = Field(default=True)


class UserLoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str


class PhoneSendOTPRequest(BaseModel):
    phone_number: str = Field(min_length=8, max_length=20, description="E.164 phone number e.g. +919876543210")
    channel: Literal["whatsapp", "sms"] = Field(default="whatsapp", description="OTP delivery channel")


class PhoneVerifyOTPRequest(BaseModel):
    phone_number: str = Field(min_length=8, max_length=20)
    otp_code: str = Field(min_length=4, max_length=8)
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    health_goals: list[str] | None = Field(default=None)


class OAuthLoginRequest(BaseModel):
    provider: Literal["google", "apple"] = Field(description="OAuth identity provider")
    id_token: str | None = Field(default=None, description="ID Token or Auth Code from Google/Apple")
    email: str = Field(min_length=3, max_length=255)
    first_name: str | None = Field(default=None)
    last_name: str | None = Field(default=None)
    avatar_url: str | None = Field(default=None)


class PasswordResetRequest(BaseModel):
    email: str | None = Field(default=None, description="Email address for reset link/code")
    phone_number: str | None = Field(default=None, description="Phone number for SMS/WhatsApp reset OTP")
    channel: Literal["email", "whatsapp", "sms"] = Field(default="email")


class PasswordResetConfirmRequest(BaseModel):
    token: str = Field(min_length=4, description="Reset token or 6-digit OTP code")
    new_password: str = Field(min_length=8, description="New password with minimum 8 characters")
    email_or_phone: str = Field(description="Email or phone number associated with request")


class OTPResponse(BaseModel):
    message: str
    channel: str
    phone_number: str
    expires_in_seconds: int = 300
    demo_otp: str | None = None  # Returned in development mode for easy testing


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
    phone_number: str | None = None
    auth_provider: str = "email"
    is_phone_verified: bool = False
    roles: list[str]
    permissions: list[str]
    avatar_url: str | None = None
    health_goals: list[str] | None = None
