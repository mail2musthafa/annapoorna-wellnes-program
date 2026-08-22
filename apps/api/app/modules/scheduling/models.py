"""Scheduling, Timezone-Aware Sessions, Instructor Availability, and Seat Holds Models."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class InstructorProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Instructor/Expert availability configuration.
    """
    __tablename__ = "instructor_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    display_name: Mapped[str] = mapped_column(String(150), nullable=False)
    headline: Mapped[str] = mapped_column(String(200), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    iana_timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata", nullable=False)
    buffer_before_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    buffer_after_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    min_booking_notice_hours: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    max_booking_horizon_days: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    availability_rules: Mapped[list["AvailabilityRule"]] = relationship(
        "AvailabilityRule",
        back_populates="instructor",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    availability_exceptions: Mapped[list["AvailabilityException"]] = relationship(
        "AvailabilityException",
        back_populates="instructor",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class AvailabilityRule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Weekly recurring availability intervals.
    """
    __tablename__ = "availability_rules"

    instructor_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("instructor_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time_str: Mapped[str] = mapped_column(String(5), nullable=False)  # "09:00"
    end_time_str: Mapped[str] = mapped_column(String(5), nullable=False)  # "17:00"

    instructor: Mapped["InstructorProfile"] = relationship("InstructorProfile", back_populates="availability_rules")


class AvailabilityException(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Date-specific blocks, time-off, or special hours.
    """
    __tablename__ = "availability_exceptions"

    instructor_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("instructor_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    start_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_unavailable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    reason: Mapped[str | None] = mapped_column(String(200), nullable=True)

    instructor: Mapped["InstructorProfile"] = relationship("InstructorProfile", back_populates="availability_exceptions")


class ClassSession(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    """
    Individual scheduled session instance with capacity and seat hold tracking.
    """
    __tablename__ = "class_sessions"

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    instructor_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("instructor_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    iana_timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    
    # Capacity management
    capacity: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    confirmed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    held_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Booking & Link release rules
    booking_open_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    booking_close_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancellation_deadline_hours: Mapped[int] = mapped_column(Integer, default=12, nullable=False)
    join_link_release_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)

    # Virtual room details
    meeting_provider: Mapped[str] = mapped_column(String(50), default="zoom", nullable=False)
    meeting_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    recording_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="scheduled", nullable=False, index=True)  # scheduled, in_progress, completed, cancelled

    seat_holds: Mapped[list["SeatHold"]] = relationship(
        "SeatHold",
        back_populates="session",
        cascade="all, delete-orphan",
    )
    waitlist_entries: Mapped[list["WaitlistEntry"]] = relationship(
        "WaitlistEntry",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class SeatHold(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    10-15 minute temporary reservation to prevent overselling while visitor is checking out.
    """
    __tablename__ = "seat_holds"

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("class_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    guest_token: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    seats_held: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    is_released: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    session: Mapped["ClassSession"] = relationship("ClassSession", back_populates="seat_holds")


class WaitlistEntry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Ordered queue for fully-booked classes.
    """
    __tablename__ = "waitlist_entries"
    __table_args__ = (
        UniqueConstraint("session_id", "user_id", name="uq_session_user_waitlist"),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("class_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    is_notified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    offer_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    session: Mapped["ClassSession"] = relationship("ClassSession", back_populates="waitlist_entries")
