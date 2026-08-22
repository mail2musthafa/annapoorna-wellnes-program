"""Coaching API Router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.modules.coaching.models import CoachProfile
from app.modules.users.models import User

router = APIRouter(prefix="/coaching", tags=["Coaching & Specialists"])


class CoachListItem(BaseModel):
    id: str
    name: str
    title: str
    specialties: str
    bio: str
    avatar_url: str | None = None
    is_accepting_clients: bool


@router.get("/coaches", response_model=list[CoachListItem], summary="List certified holistic coaches")
async def list_coaches(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CoachProfile)
        .options(selectinload(CoachProfile.user).selectinload(User.profile))
        .where(CoachProfile.is_accepting_clients.is_(True))
    )
    coaches = res.scalars().all()
    return [
        CoachListItem(
            id=str(c.id),
            name=f"{c.user.profile.first_name} {c.user.profile.last_name}" if c.user and c.user.profile else "Coach",
            title=c.title,
            specialties=c.specialties,
            bio=c.bio,
            avatar_url=c.user.profile.avatar_url if c.user and c.user.profile else None,
            is_accepting_clients=c.is_accepting_clients,
        )
        for c in coaches
    ]
