"""Scheduling, Timezone-Aware Calendar, and Seat Hold API Endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import UserContext
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context, get_optional_user_context
from app.modules.scheduling.schemas import (
    ClassSessionListItem,
    HoldSeatRequest,
    HoldSeatResponse,
    JoinWaitlistRequest,
    WaitlistResponse,
)
from app.modules.scheduling.service import SchedulingService

router = APIRouter(prefix="/calendar", tags=["Calendar & Scheduling"])


@router.get("/sessions", response_model=list[ClassSessionListItem], summary="List scheduled class sessions with real-time seat availability")
async def get_scheduled_sessions(
    pillar: str | None = Query(None, description="Filter by lifestyle pillar"),
    instructor_id: uuid.UUID | None = Query(None, description="Filter by instructor ID"),
    db: AsyncSession = Depends(get_db),
):
    service = SchedulingService(db)
    return await service.list_upcoming_sessions(pillar=pillar, instructor_id=instructor_id)


@router.post("/hold-seat", response_model=HoldSeatResponse, summary="Create a 15-minute temporary seat hold to prevent overselling")
async def hold_seat(
    req: HoldSeatRequest,
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = SchedulingService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else None
    return await service.create_seat_hold(
        session_id=req.session_id,
        seats=req.seats,
        user_id=user_id,
        guest_token=req.guest_token,
    )


@router.post("/waitlist", response_model=WaitlistResponse, summary="Join the waitlist for a full class")
async def join_waitlist(
    req: JoinWaitlistRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = SchedulingService(db)
    user_id = uuid.UUID(user_context.user_id)
    return await service.join_waitlist(session_id=req.session_id, user_id=user_id)
