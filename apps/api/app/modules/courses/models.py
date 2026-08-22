"""Courses, Modules, Lessons, and Progress Tracking Database Models."""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Course(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    pillar_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pillars.id", ondelete="SET NULL"),
        nullable=True,
    )
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    modules: Mapped[list["CourseModule"]] = relationship(
        "CourseModule",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="CourseModule.display_order",
        lazy="selectin",
    )


class CourseModule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "course_modules"

    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[list["Lesson"]] = relationship(
        "Lesson",
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="Lesson.display_order",
        lazy="selectin",
    )


class Lesson(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "lessons"

    module_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("course_modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    content_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_free_preview: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    module: Mapped["CourseModule"] = relationship("CourseModule", back_populates="lessons")


class LessonProgress(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "lesson_progress"
    __table_args__ = (
        UniqueConstraint("lesson_id", "user_id", name="uq_lesson_user_progress"),
    )

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_position_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
