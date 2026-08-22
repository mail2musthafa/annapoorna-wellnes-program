"""Alembic Async Migrations Environment."""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.db.base import Base
from app.modules.audit.models import *  # noqa
from app.modules.coaching.models import *  # noqa
from app.modules.community.models import *  # noqa
from app.modules.content.models import *  # noqa
from app.modules.courses.models import *  # noqa
from app.modules.events.models import *  # noqa
from app.modules.leads.models import *  # noqa
from app.modules.live_classes.models import *  # noqa
from app.modules.meal_plans.models import *  # noqa
from app.modules.media.models import *  # noqa
from app.modules.memberships.models import *  # noqa
from app.modules.notifications.models import *  # noqa
from app.modules.payments.models import *  # noqa
from app.modules.pillars.models import *  # noqa
from app.modules.programs.models import *  # noqa
from app.modules.recipes.models import *  # noqa

# Import all models so that Alembic knows about them
from app.modules.roles.models import *  # noqa
from app.modules.users.models import *  # noqa
from app.modules.wellness_tracking.models import *  # noqa

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
