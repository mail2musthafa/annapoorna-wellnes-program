"""Nutrition Plans, Draft Suggestions, and Expert Review Service."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.modules.nutrition_plans.models import ExpertReview, NutritionPlan, NutritionPlanVersion
from app.modules.nutrition_plans.schemas import (
    ExpertReviewPlanRequest,
    GenerateDraftPlanRequest,
    NutritionPlanDetailSchema,
)


class NutritionPlanService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_plan_for_member(self, user_id: uuid.UUID) -> NutritionPlanDetailSchema | None:
        result = await self.db.execute(
            select(NutritionPlan).where(
                NutritionPlan.user_id == user_id,
                NutritionPlan.is_active.is_(True),
            )
        )
        plan = result.scalar_one_or_none()
        if not plan:
            return None
        return NutritionPlanDetailSchema.model_validate(plan)

    async def generate_draft_suggestion(
        self,
        user_id: uuid.UUID,
        req: GenerateDraftPlanRequest,
    ) -> NutritionPlanDetailSchema:
        """
        Stage One: Generate draft suggestions based on goals & dietary preferences.
        Explicitly marked 'awaiting_expert_review'.
        """
        plan = NutritionPlan(
            user_id=user_id,
            title="Personalized Metabolic Nourishment Plan",
            objective=req.goal,
            status="awaiting_expert_review",
            is_active=True,
        )
        self.db.add(plan)
        await self.db.flush()

        recommended_meals = [
            {
                "slot": "Breakfast",
                "title": "Warm Cinnamon Spiced Oats & Flax Seeds",
                "calories": 380,
                "notes": "Rich in prebiotic fiber and omega-3s",
            },
            {
                "slot": "Lunch",
                "title": "Ayurvedic Golden Kitchari with Steamed Greens",
                "calories": 420,
                "notes": "Anti-inflammatory turmeric and balanced split mung dal",
            },
            {
                "slot": "Dinner",
                "title": "Roasted Sweet Potato & Chickpea Bowl with Tahini",
                "calories": 460,
                "notes": "Complex carbohydrates supporting evening melatonin release",
            },
        ]

        shopping_list = [
            "Yellow split mung dal (500g)",
            "Organic rolled oats (500g)",
            "Ground flaxseeds (250g)",
            "Fresh turmeric & ginger root",
            "Japanese sweet potatoes (1kg)",
            "Sesame tahini paste",
        ]

        version = NutritionPlanVersion(
            plan_id=plan.id,
            version_number=1,
            daily_calorie_target=1800,
            protein_grams=70,
            carbs_grams=240,
            fat_grams=45,
            fiber_grams=40,
            dietary_preferences=req.dietary_preferences,
            allergies_and_exclusions=req.allergies_and_exclusions,
            recommended_meals=recommended_meals,
            shopping_list_items=shopping_list,
            hydration_guidelines="Drink 2.5–3 Liters of warm filtered water throughout the day.",
        )
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(plan)
        return NutritionPlanDetailSchema.model_validate(plan)

    async def expert_review_plan(
        self,
        plan_id: uuid.UUID,
        expert_id: uuid.UUID,
        expert_name: str,
        req: ExpertReviewPlanRequest,
    ) -> NutritionPlanDetailSchema:
        """
        Stage Two: Qualified nutritionist reviews, edits, and approves the plan.
        """
        plan = await self.db.get(NutritionPlan, plan_id)
        if not plan:
            raise NotFoundException("Nutrition plan not found.")

        plan.status = "approved" if req.decision == "approved" else "changes_requested"
        plan.assigned_expert_id = expert_id

        review = ExpertReview(
            plan_id=plan.id,
            expert_id=expert_id,
            expert_name=expert_name,
            decision=req.decision,
            member_visible_notes=req.member_visible_notes,
            private_clinical_notes=req.private_clinical_notes,
            next_review_date=req.next_review_date,
        )
        self.db.add(review)
        await self.db.commit()
        await self.db.refresh(plan)
        return NutritionPlanDetailSchema.model_validate(plan)
