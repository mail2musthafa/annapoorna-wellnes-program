"""Events and Community Webinars Database Models."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Event(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "events"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    location_or_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_virtual: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)

    rsvps: Mapped[list["EventRSVP"]] = relationship("EventRSVP", back_populates="event", cascade="all, delete-orphan")


class EventRSVP(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "event_rsvps"

    event_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String(30), default="attending", nullable=False)

    event: Mapped["Event"] = relationship("Event", back_populates="rsvps")
