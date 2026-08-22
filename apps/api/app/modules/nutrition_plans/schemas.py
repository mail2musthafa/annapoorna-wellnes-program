"""Nutrition Plans, Draft Suggestions, and 2-Stage Expert Review Schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NutritionPlanVersionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    version_number: int
    daily_calorie_target: int | None = None
    protein_grams: int | None = None
    carbs_grams: int | None = None
    fat_grams: int | None = None
    fiber_grams: int | None = None
    dietary_preferences: list[str] = []
    allergies_and_exclusions: list[str] = []
    recommended_meals: list[dict] = []
    shopping_list_items: list[str] = []
    hydration_guidelines: str | None = None


class ExpertReviewSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    expert_id: uuid.UUID
    expert_name: str
    decision: str  # approved, changes_requested, rejected
    member_visible_notes: str
    next_review_date: datetime | None = None
    created_at: datetime


class NutritionPlanDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    assigned_expert_id: uuid.UUID | None = None
    title: str
    objective: str
    status: str  # draft, awaiting_expert_review, approved, published, archived
    is_active: bool
    versions: list[NutritionPlanVersionSchema] = []
    reviews: list[ExpertReviewSchema] = []


class GenerateDraftPlanRequest(BaseModel):
    goal: str
    dietary_preferences: list[str] = ["Plant-Based", "Gluten-Free"]
    allergies_and_exclusions: list[str] = []


class ExpertReviewPlanRequest(BaseModel):
    decision: str = "approved"  # approved, changes_requested, rejected
    member_visible_notes: str
    private_clinical_notes: str | None = None
    next_review_date: datetime | None = None
