"""Wellness Check-Ins and Progress Tracking Database Models."""

import uuid
from datetime import date

from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class WellnessCheckIn(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "wellness_check_ins"
    __table_args__ = (
        UniqueConstraint("user_id", "check_in_date", name="uq_user_daily_checkin"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    check_in_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    energy_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sleep_quality_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mindfulness_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    movement_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    nutrition_compliance: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    reflection_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    entries: Mapped[list["ProgressEntry"]] = relationship("ProgressEntry", back_populates="check_in", cascade="all, delete-orphan")


class ProgressEntry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "progress_entries"

    check_in_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("wellness_check_ins.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("metric_definitions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    value_numeric: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    value_text: Mapped[str | None] = mapped_column(String(255), nullable=True)

    check_in: Mapped["WellnessCheckIn"] = relationship("WellnessCheckIn", back_populates="entries")
