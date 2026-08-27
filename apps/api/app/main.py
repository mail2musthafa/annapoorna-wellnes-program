"""Annapoorna Portal Backend Application Main Entrypoint."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.exceptions import DomainException
from app.core.logging import setup_logging
from app.core.middleware import RequestContextMiddleware
from app.db.session import engine, get_db

# Setup structured logging
setup_logging()
logger = logging.getLogger("annapoorna.app")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info(f"Starting {settings.APP_NAME} in [{settings.APP_ENV}] mode...")
    try:
        async with engine.begin() as conn:
            from app.db.base import Base
            import app.modules.users.models  # noqa
            import app.modules.roles.models  # noqa
            import app.modules.pillars.models  # noqa
            import app.modules.programs.models  # noqa
            import app.modules.courses.models  # noqa
            import app.modules.recipes.models  # noqa
            import app.modules.meal_plans.models  # noqa
            import app.modules.live_classes.models  # noqa
            import app.modules.coaching.models  # noqa
            import app.modules.community.models  # noqa
            import app.modules.commerce.models  # noqa
            import app.modules.enquiries.models  # noqa
            import app.modules.leads.models  # noqa
            import app.modules.notifications.models  # noqa
            import app.modules.audit.models  # noqa
            import app.modules.wellness_tracking.models  # noqa

            await conn.run_sync(Base.metadata.create_all)

            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);"))
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';"))
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);"))
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;"))
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE;"))
                await conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(30);"))
                await conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(30);"))
                await conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS health_goals TEXT;"))
                await conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wellness_interests TEXT;"))
            except Exception:
                pass
        logger.info("Database schema synchronized.")
    except Exception as e:
        logger.warning(f"Database initialization notice: {e}")

    yield

    logger.info(f"Shutting down {settings.APP_NAME}...")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Holistic lifestyle education, coaching, membership and community platform built on Six Pillars.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Custom Middlewares
app.add_middleware(RequestContextMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Domain Exception Handler
@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "code": exc.code,
            "message": exc.detail,
            "extra": exc.extra,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


# Root Endpoint
@app.get("/", tags=["Observability"], summary="API Root Info")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "api_v1": settings.API_V1_STR,
    }


# Health and Readiness Probes
@app.get("/health", tags=["Observability"], summary="Liveness probe")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "0.1.0",
    }


@app.get("/ready", tags=["Observability"], summary="Readiness probe (checks DB)")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {e}"
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "database": db_status},
        )

    return {
        "status": "ready",
        "database": db_status,
        "redis": "configured",
    }


import os
from fastapi.staticfiles import StaticFiles

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Mount API v1
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
