"""Memberships API Router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.memberships.models import MembershipPlan

router = APIRouter(prefix="/memberships", tags=["Memberships & Subscriptions"])


class MembershipPlanItem(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    billing_interval: str
    price_cents: int
    currency: str
    trial_period_days: int


@router.get("/plans", response_model=list[MembershipPlanItem], summary="List active membership tiers")
async def list_plans(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(MembershipPlan).where(MembershipPlan.is_active.is_(True), MembershipPlan.is_deleted.is_(False))
    )
    plans = res.scalars().all()
    return [
        MembershipPlanItem(
            id=str(p.id),
            name=p.name,
            slug=p.slug,
            description=p.description,
            billing_interval=p.billing_interval,
            price_cents=p.price_cents,
            currency=p.currency,
            trial_period_days=p.trial_period_days,
        )
        for p in plans
    ]
