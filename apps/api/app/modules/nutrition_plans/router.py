"""Nutrition Plans and 2-Stage Expert Review API Router."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import UserContext
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context
from app.modules.nutrition_plans.schemas import (
    ExpertReviewPlanRequest,
    GenerateDraftPlanRequest,
    NutritionPlanDetailSchema,
)
from app.modules.nutrition_plans.service import NutritionPlanService

router = APIRouter(prefix="/nutrition-plans", tags=["Nutrition Plans & Expert Review"])


@router.get("/me", response_model=NutritionPlanDetailSchema | None, summary="Get active nutrition plan for authenticated member")
async def get_my_nutrition_plan(
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = NutritionPlanService(db)
    user_id = uuid.UUID(user_context.user_id)
    return await service.get_plan_for_member(user_id=user_id)


@router.post("/draft", response_model=NutritionPlanDetailSchema, status_code=status.HTTP_201_CREATED, summary="Stage 1: Generate draft nutrition suggestion (awaiting expert review)")
async def generate_draft_plan(
    req: GenerateDraftPlanRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = NutritionPlanService(db)
    user_id = uuid.UUID(user_context.user_id)
    return await service.generate_draft_suggestion(user_id=user_id, req=req)


@router.post("/{plan_id}/review", response_model=NutritionPlanDetailSchema, summary="Stage 2: Qualified nutritionist reviews, approves, and publishes plan")
async def review_nutrition_plan(
    plan_id: uuid.UUID,
    req: ExpertReviewPlanRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = NutritionPlanService(db)
    expert_id = uuid.UUID(user_context.user_id)
    return await service.expert_review_plan(
        plan_id=plan_id,
        expert_id=expert_id,
        expert_name=user_context.email,
        req=req,
    )
