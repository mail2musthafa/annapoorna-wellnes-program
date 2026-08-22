"""Application Configuration using Pydantic Settings v2."""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Core App
    APP_NAME: str = "Annapoorna Portal"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    APP_SECRET_KEY: str = "dev-secret-key-super-secure-32chars-min-change-in-production"
    API_V1_STR: str = "/api/v1"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://annapoorna_user:annapoorna_secure_password@localhost:5432/annapoorna_db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 5

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT & Auth
    JWT_SECRET_KEY: str = "dev-jwt-secret-key-super-secure-32chars-min-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day in dev
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 2

    # Background Jobs / Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Integrations
    EMAIL_PROVIDER: str = "console"  # console, smtp, ses
    EMAIL_FROM_ADDRESS: str = "noreply@annapoorna.wellness"
    EMAIL_FROM_NAME: str = "Annapoorna Portal"

    STORAGE_PROVIDER: str = "local"  # local, s3
    STORAGE_LOCAL_ROOT: str = "./storage/uploads"

    PAYMENT_PROVIDER: str = "mock"  # mock, stripe, razorpay
    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    MEETING_PROVIDER: str = "mock"  # mock, zoom


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
