"""Nutrition Plans, Draft Suggestions, and 2-Stage Expert Review Database Models."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class NutritionPlan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Member-specific nutrition plan container.
    """
    __tablename__ = "nutrition_plans"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assigned_expert_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    objective: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="draft", nullable=False, index=True
    )  # draft, awaiting_expert_review, approved, published, archived
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    versions: Mapped[list["NutritionPlanVersion"]] = relationship(
        "NutritionPlanVersion",
        back_populates="nutrition_plan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    reviews: Mapped[list["ExpertReview"]] = relationship(
        "ExpertReview",
        back_populates="nutrition_plan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class NutritionPlanVersion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Specific snapshot of meal recommendations, ingredient exclusions, and dietary guidelines.
    """
    __tablename__ = "nutrition_plan_versions"

    plan_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("nutrition_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    daily_calorie_target: Mapped[int | None] = mapped_column(Integer, nullable=True)
    protein_grams: Mapped[int | None] = mapped_column(Integer, nullable=True)
    carbs_grams: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fat_grams: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fiber_grams: Mapped[int | None] = mapped_column(Integer, nullable=True)
    dietary_preferences: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    allergies_and_exclusions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    recommended_meals: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    shopping_list_items: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    hydration_guidelines: Mapped[str | None] = mapped_column(Text, nullable=True)

    nutrition_plan: Mapped["NutritionPlan"] = relationship("NutritionPlan", back_populates="versions")


class ExpertReview(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Clinical/Expert audit record for plan approval.
    """
    __tablename__ = "expert_reviews"

    plan_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("nutrition_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    expert_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    expert_name: Mapped[str] = mapped_column(String(150), nullable=False)
    decision: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # approved, changes_requested, rejected
    member_visible_notes: Mapped[str] = mapped_column(Text, nullable=False)
    private_clinical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_review_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    nutrition_plan: Mapped["NutritionPlan"] = relationship("NutritionPlan", back_populates="reviews")
