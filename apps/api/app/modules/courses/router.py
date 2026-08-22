"""Courses API Router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.modules.courses.models import Course

router = APIRouter(prefix="/courses", tags=["Courses & Learning"])


class LessonSummary(BaseModel):
    id: str
    title: str
    slug: str
    duration_minutes: int
    is_free_preview: bool


class ModuleSummary(BaseModel):
    id: str
    title: str
    display_order: int
    lessons: list[LessonSummary] = []


class CourseSummary(BaseModel):
    id: str
    title: str
    slug: str
    summary: str
    modules_count: int


@router.get("", response_model=list[CourseSummary], summary="List published courses")
async def list_courses(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Course)
        .options(selectinload(Course.modules))
        .where(Course.is_published.is_(True), Course.is_deleted.is_(False))
    )
    courses = res.scalars().all()
    return [
        CourseSummary(
            id=str(c.id),
            title=c.title,
            slug=c.slug,
            summary=c.summary,
            modules_count=len(c.modules),
        )
        for c in courses
    ]
