"""SQLAlchemy Base Model with Naming Conventions."""

from sqlalchemy.orm import DeclarativeBase

from app.db.naming_conventions import metadata


class Base(DeclarativeBase):
    metadata = metadata
