"""Live Classes, Bookings, Attendance, and Recordings Database Models."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.shared.enums import BookingStatus, LiveClassStatus

if TYPE_CHECKING:
    from app.modules.users.models import User


class LiveClass(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "live_classes"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    current_bookings_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Meeting integration
    meeting_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    meeting_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    recording_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    status: Mapped[str] = mapped_column(String(50), default=LiveClassStatus.SCHEDULED, nullable=False, index=True)
    pillar_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pillars.id", ondelete="SET NULL"),
        nullable=True,
    )
    instructor_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    bookings: Mapped[list["LiveClassBooking"]] = relationship(
        "LiveClassBooking",
        back_populates="live_class",
        cascade="all, delete-orphan",
    )


class LiveClassBooking(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "live_class_bookings"
    __table_args__ = (
        UniqueConstraint("live_class_id", "user_id", name="uq_live_class_user_booking"),
    )

    live_class_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("live_classes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String(50), default=BookingStatus.CONFIRMED, nullable=False)
    attended: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    live_class: Mapped["LiveClass"] = relationship("LiveClass", back_populates="bookings")
    user: Mapped["User"] = relationship("User")


class LiveClassAttendance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "live_class_attendances"

    booking_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("live_class_bookings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)


class LiveClassRecording(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "live_class_recordings"

    live_class_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("live_classes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    video_url: Mapped[str] = mapped_column(String(500), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    is_processed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
