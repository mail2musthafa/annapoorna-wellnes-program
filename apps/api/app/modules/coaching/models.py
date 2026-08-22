"""Coaching, Client Assignments, Appointments, and Private Notes Models."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.modules.users.models import User


class CoachProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "coach_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    specialties: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    is_accepting_clients: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    booking_calendar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship("User")


class CoachAssignment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "coach_assignments"

    coach_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    member_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Appointment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "appointments"

    coach_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    member_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="scheduled", nullable=False)
    meeting_url: Mapped[str | None] = mapped_column(String(500), nullable=True)


class CoachNote(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "coach_notes"

    coach_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    member_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    note_content: Mapped[str] = mapped_column(Text, nullable=False)
    is_private_to_coach: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
