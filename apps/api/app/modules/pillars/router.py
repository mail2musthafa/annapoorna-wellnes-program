"""Pillars API Router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.pillars.schemas import PillarResponse
from app.modules.pillars.service import PillarService

router = APIRouter(prefix="/pillars", tags=["Six Lifestyle Pillars"])


@router.get(
    "",
    response_model=list[PillarResponse],
    summary="List all six managed lifestyle pillars",
)
async def list_pillars(db: AsyncSession = Depends(get_db)):
    service = PillarService(db)
    return await service.get_all_pillars()


@router.get(
    "/{slug}",
    response_model=PillarResponse,
    summary="Get details of a specific lifestyle pillar by slug",
)
async def get_pillar(slug: str, db: AsyncSession = Depends(get_db)):
    service = PillarService(db)
    return await service.get_pillar_by_slug(slug)
