"""Educational Content, Articles, and Medical Review Metadata Models."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.shared.enums import ContentStatus


class Article(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "articles"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    featured_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default=ContentStatus.PUBLISHED, nullable=False, index=True)
    pillar_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pillars.id", ondelete="SET NULL"),
        nullable=True,
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    is_medically_reviewed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reviewed_by_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    reviewed_by_credentials: Mapped[str | None] = mapped_column(String(150), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_disclaimer: Mapped[str | None] = mapped_column(
        Text,
        default="This article is for educational wellness purposes only and does not constitute medical advice or diagnosis.",
        nullable=True,
    )

    tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
