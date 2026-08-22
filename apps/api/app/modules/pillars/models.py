"""Six Lifestyle Pillars Database Models."""

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Pillar(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "pillars"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    tagline: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon_name: Mapped[str] = mapped_column(String(100), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    education_summary: Mapped[str] = mapped_column(Text, nullable=False)
    management_summary: Mapped[str] = mapped_column(Text, nullable=False)
    analysis_summary: Mapped[str] = mapped_column(Text, nullable=False)

    goals: Mapped[list["PillarGoal"]] = relationship("PillarGoal", back_populates="pillar", cascade="all, delete-orphan")
    metrics: Mapped[list["MetricDefinition"]] = relationship("MetricDefinition", back_populates="pillar", cascade="all, delete-orphan")


class PillarGoal(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "pillar_goals"

    pillar_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pillars.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_frequency: Mapped[str] = mapped_column(String(50), default="daily", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    pillar: Mapped["Pillar"] = relationship("Pillar", back_populates="goals")


class MetricDefinition(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "metric_definitions"

    pillar_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pillars.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    data_type: Mapped[str] = mapped_column(String(30), default="numeric", nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    pillar: Mapped["Pillar"] = relationship("Pillar", back_populates="metrics")
