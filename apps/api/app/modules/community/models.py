"""Community Spaces, Posts, Comments, Reactions, Reports, and Moderation Database Models."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.shared.enums import ModerationStatus

if TYPE_CHECKING:
    from app.modules.users.models import User


class CommunitySpace(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "community_spaces"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    posts: Mapped[list["Post"]] = relationship("Post", back_populates="space", cascade="all, delete-orphan")


class Post(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "posts"

    space_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("community_spaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    media_urls: Mapped[list[str] | None] = mapped_column(JSON, default=list, nullable=True)
    pillar_tag: Mapped[str | None] = mapped_column(String(50), nullable=True)
    post_type: Mapped[str] = mapped_column(String(50), default="discussion", nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    moderation_status: Mapped[str] = mapped_column(String(50), default=ModerationStatus.APPROVED, nullable=False, index=True)

    space: Mapped["CommunitySpace"] = relationship("CommunitySpace", back_populates="posts")
    author: Mapped["User"] = relationship("User")
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    reactions: Mapped[list["Reaction"]] = relationship("Reaction", back_populates="post", cascade="all, delete-orphan")


class Comment(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "comments"

    post_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    moderation_status: Mapped[str] = mapped_column(String(50), default=ModerationStatus.APPROVED, nullable=False)

    post: Mapped["Post"] = relationship("Post", back_populates="comments")
    author: Mapped["User"] = relationship("User")


class Reaction(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "reactions"

    post_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reaction_type: Mapped[str] = mapped_column(String(30), default="like", nullable=False)

    post: Mapped["Post"] = relationship("Post", back_populates="reactions")


class ContentReport(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "content_reports"

    reporter_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    target_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    reason: Mapped[str] = mapped_column(String(100), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False, index=True)


class ModerationAction(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "moderation_actions"

    moderator_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    target_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_id: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
