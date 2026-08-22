"""Pillars Service and Database Queries."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException
from app.modules.pillars.models import Pillar
from app.modules.pillars.schemas import (
    MetricDefinitionResponse,
    PillarGoalResponse,
    PillarResponse,
)


class PillarService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_pillars(self) -> list[PillarResponse]:
        query = (
            select(Pillar)
            .options(
                selectinload(Pillar.goals),
                selectinload(Pillar.metrics),
            )
            .where(Pillar.is_active.is_(True))
            .order_by(Pillar.display_order.asc())
        )
        result = await self.db.execute(query)
        pillars = result.scalars().all()

        return [
            PillarResponse(
                id=str(p.id),
                name=p.name,
                slug=p.slug,
                tagline=p.tagline,
                description=p.description,
                icon_name=p.icon_name,
                display_order=p.display_order,
                education_summary=p.education_summary,
                management_summary=p.management_summary,
                analysis_summary=p.analysis_summary,
                goals=[
                    PillarGoalResponse(
                        id=str(g.id),
                        title=g.title,
                        description=g.description,
                        suggested_frequency=g.suggested_frequency,
                    )
                    for g in p.goals
                ],
                metrics=[
                    MetricDefinitionResponse(
                        id=str(m.id),
                        name=m.name,
                        code=m.code,
                        unit=m.unit,
                        data_type=m.data_type,
                        description=m.description,
                    )
                    for m in p.metrics
                ],
            )
            for p in pillars
        ]

    async def get_pillar_by_slug(self, slug: str) -> PillarResponse:
        query = (
            select(Pillar)
            .options(
                selectinload(Pillar.goals),
                selectinload(Pillar.metrics),
            )
            .where(Pillar.slug == slug, Pillar.is_active.is_(True))
        )
        result = await self.db.execute(query)
        p = result.scalar_one_or_none()
        if not p:
            raise NotFoundException("Pillar", slug)

        return PillarResponse(
            id=str(p.id),
            name=p.name,
            slug=p.slug,
            tagline=p.tagline,
            description=p.description,
            icon_name=p.icon_name,
            display_order=p.display_order,
            education_summary=p.education_summary,
            management_summary=p.management_summary,
            analysis_summary=p.analysis_summary,
            goals=[
                PillarGoalResponse(
                    id=str(g.id),
                    title=g.title,
                    description=g.description,
                    suggested_frequency=g.suggested_frequency,
                )
                for g in p.goals
            ],
            metrics=[
                MetricDefinitionResponse(
                    id=str(m.id),
                    name=m.name,
                    code=m.code,
                    unit=m.unit,
                    data_type=m.data_type,
                    description=m.description,
                )
                for m in p.metrics
            ],
        )
