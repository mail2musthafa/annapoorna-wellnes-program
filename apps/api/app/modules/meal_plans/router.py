"""Meal Plans API Router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.meal_plans.models import MealPlan

router = APIRouter(prefix="/meal-plans", tags=["Meal Plans"])


class MealPlanSummary(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    duration_weeks: int
    pdf_resource_url: str | None = None


@router.get("", response_model=list[MealPlanSummary], summary="List active meal plans")
async def list_meal_plans(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(MealPlan).where(MealPlan.is_active.is_(True)))
    plans = res.scalars().all()
    return [
        MealPlanSummary(
            id=str(p.id),
            title=p.title,
            slug=p.slug,
            description=p.description,
            duration_weeks=p.duration_weeks,
            pdf_resource_url=p.pdf_resource_url,
        )
        for p in plans
    ]
