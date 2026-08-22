"""Educational Content and Articles API Router."""

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.content.models import Article
from app.shared.enums import ContentStatus

router = APIRouter(prefix="/content", tags=["Educational Content & Articles"])


class ArticleSummary(BaseModel):
    id: str
    title: str
    slug: str
    summary: str
    featured_image_url: str | None = None
    is_medically_reviewed: bool
    reviewed_by_name: str | None = None
    reviewed_by_credentials: str | None = None
    reviewed_at: datetime | None = None
    review_disclaimer: str | None = None


@router.get("/articles", response_model=list[ArticleSummary], summary="List published educational articles")
async def list_articles(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Article).where(Article.status == ContentStatus.PUBLISHED, Article.is_deleted.is_(False))
    )
    articles = res.scalars().all()
    return [
        ArticleSummary(
            id=str(a.id),
            title=a.title,
            slug=a.slug,
            summary=a.summary,
            featured_image_url=a.featured_image_url,
            is_medically_reviewed=a.is_medically_reviewed,
            reviewed_by_name=a.reviewed_by_name,
            reviewed_by_credentials=a.reviewed_by_credentials,
            reviewed_at=a.reviewed_at,
            review_disclaimer=a.review_disclaimer,
        )
        for a in articles
    ]
