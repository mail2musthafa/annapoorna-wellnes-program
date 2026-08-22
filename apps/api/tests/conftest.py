"""Pytest Fixtures and Test Environment Setup."""

import asyncio
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.modules.audit.models import *  # noqa
from app.modules.coaching.models import *  # noqa
from app.modules.commerce.models import *  # noqa
from app.modules.community.models import *  # noqa
from app.modules.content.models import *  # noqa
from app.modules.courses.models import *  # noqa
from app.modules.enquiries.models import *  # noqa
from app.modules.events.models import *  # noqa
from app.modules.leads.models import *  # noqa
from app.modules.live_classes.models import *  # noqa
from app.modules.meal_plans.models import *  # noqa
from app.modules.media.models import *  # noqa
from app.modules.memberships.models import *  # noqa
from app.modules.notifications.models import *  # noqa
from app.modules.nutrition_plans.models import *  # noqa
from app.modules.payments.models import *  # noqa
from app.modules.pillars.models import *  # noqa
from app.modules.programs.models import *  # noqa
from app.modules.recipes.models import *  # noqa
from app.modules.roles.models import *  # noqa
from app.modules.scheduling.models import *  # noqa
from app.modules.users.models import *  # noqa
from app.modules.wellness_tracking.models import *  # noqa
from scripts.seed import seed_data

# Use in-memory SQLite with aiosqlite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        await seed_data(session)
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

    app.dependency_overrides.clear()
