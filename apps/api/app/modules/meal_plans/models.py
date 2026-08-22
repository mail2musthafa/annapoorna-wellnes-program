"""Meal Plan and Weekly Scheduling Database Models."""

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class MealPlan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "meal_plans"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    pdf_resource_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    weeks: Mapped[list["MealPlanWeek"]] = relationship(
        "MealPlanWeek",
        back_populates="meal_plan",
        cascade="all, delete-orphan",
        order_by="MealPlanWeek.week_number",
        lazy="selectin",
    )


class MealPlanWeek(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "meal_plan_weeks"

    meal_plan_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("meal_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    week_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    focus_theme: Mapped[str | None] = mapped_column(String(255), nullable=True)

    meal_plan: Mapped["MealPlan"] = relationship("MealPlan", back_populates="weeks")
    days: Mapped[list["MealPlanDay"]] = relationship(
        "MealPlanDay",
        back_populates="week",
        cascade="all, delete-orphan",
        order_by="MealPlanDay.day_number",
        lazy="selectin",
    )


class MealPlanDay(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "meal_plan_days"

    week_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("meal_plan_weeks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    day_name: Mapped[str] = mapped_column(String(30), nullable=False)

    week: Mapped["MealPlanWeek"] = relationship("MealPlanWeek", back_populates="days")
    slots: Mapped[list["MealSlot"]] = relationship(
        "MealSlot",
        back_populates="day",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class MealSlot(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "meal_slots"

    day_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("meal_plan_days.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slot_type: Mapped[str] = mapped_column(String(50), nullable=False)
    recipe_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("recipes.id", ondelete="SET NULL"),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    day: Mapped["MealPlanDay"] = relationship("MealPlanDay", back_populates="slots")
