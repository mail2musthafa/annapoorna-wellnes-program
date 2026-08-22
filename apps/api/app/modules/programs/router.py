"""Programs API Router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.programs.models import Program
from app.shared.enums import ProgramStatus

router = APIRouter(prefix="/programs", tags=["Programs & Cohorts"])


class ProgramListItem(BaseModel):
    id: str
    title: str
    slug: str
    tagline: str
    description: str
    duration_weeks: int
    price_cents: int
    currency: str
    status: str
    image_url: str | None = None


@router.get("", response_model=list[ProgramListItem], summary="List published lifestyle programs")
async def list_programs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Program).where(Program.status == ProgramStatus.PUBLISHED, Program.is_deleted.is_(False))
    )
    programs = result.scalars().all()
    return [
        ProgramListItem(
            id=str(p.id),
            title=p.title,
            slug=p.slug,
            tagline=p.tagline,
            description=p.description,
            duration_weeks=p.duration_weeks,
            price_cents=p.price_cents,
            currency=p.currency,
            status=p.status,
            image_url=p.image_url,
        )
        for p in programs
    ]
