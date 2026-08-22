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
    # Optional startup verification
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connectivity confirmed.")
    except Exception as e:
        logger.warning(f"Database pre-check notice (may connect during requests): {e}")

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
