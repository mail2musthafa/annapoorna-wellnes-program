"""Programs, Cohorts, and Enrolments Database Models."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.shared.enums import EnrollmentStatus, ProgramStatus

if TYPE_CHECKING:
    from app.modules.users.models import User


class Program(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "programs"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    tagline: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    price_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=ProgramStatus.PUBLISHED, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    cohorts: Mapped[list["ProgramCohort"]] = relationship(
        "ProgramCohort",
        back_populates="program",
        cascade="all, delete-orphan",
    )
    enrollments: Mapped[list["ProgramEnrollment"]] = relationship(
        "ProgramEnrollment",
        back_populates="program",
    )


class ProgramCohort(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "program_cohorts"

    program_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("programs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    is_open_for_enrollment: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    program: Mapped["Program"] = relationship("Program", back_populates="cohorts")


class ProgramEnrollment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "program_enrollments"
    __table_args__ = (
        UniqueConstraint("program_id", "user_id", name="uq_program_user_enrollment"),
    )

    program_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("programs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    cohort_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("program_cohorts.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(50), default=EnrollmentStatus.ACTIVE, nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    program: Mapped["Program"] = relationship("Program", back_populates="enrollments")
    user: Mapped["User"] = relationship("User")
