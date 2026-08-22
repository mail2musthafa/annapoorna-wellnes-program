"""Wellness Tracking API Router (Strictly Non-Diagnostic)."""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import UserContext
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context
from app.modules.wellness_tracking.models import WellnessCheckIn

router = APIRouter(prefix="/wellness", tags=["Wellness & Habit Tracking"])


class DailyCheckInRequest(BaseModel):
    check_in_date: date
    energy_score: int | None = Field(None, ge=1, le=10)
    sleep_quality_score: int | None = Field(None, ge=1, le=10)
    mindfulness_score: int | None = Field(None, ge=1, le=10)
    movement_minutes: int | None = Field(None, ge=0)
    nutrition_compliance: bool | None = None
    reflection_notes: str | None = None


@router.post("/check-in", status_code=status.HTTP_200_OK, summary="Record daily lifestyle check-in")
async def record_check_in(
    req: DailyCheckInRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    user_id = uuid.UUID(user_context.user_id)
    # Check existing for date
    res = await db.execute(
        select(WellnessCheckIn).where(
            WellnessCheckIn.user_id == user_id,
            WellnessCheckIn.check_in_date == req.check_in_date,
        )
    )
    check_in = res.scalar_one_or_none()

    if check_in:
        check_in.energy_score = req.energy_score
        check_in.sleep_quality_score = req.sleep_quality_score
        check_in.mindfulness_score = req.mindfulness_score
        check_in.movement_minutes = req.movement_minutes
        check_in.nutrition_compliance = req.nutrition_compliance
        check_in.reflection_notes = req.reflection_notes
    else:
        check_in = WellnessCheckIn(
            user_id=user_id,
            check_in_date=req.check_in_date,
            energy_score=req.energy_score,
            sleep_quality_score=req.sleep_quality_score,
            mindfulness_score=req.mindfulness_score,
            movement_minutes=req.movement_minutes,
            nutrition_compliance=req.nutrition_compliance,
            reflection_notes=req.reflection_notes,
        )
        db.add(check_in)

    await db.commit()
    return {
        "status": "success",
        "message": "Wellness check-in recorded. Keep up the holistic routine!",
        "disclaimer": "This data represents personal lifestyle reflection and is not medical diagnosis.",
    }
