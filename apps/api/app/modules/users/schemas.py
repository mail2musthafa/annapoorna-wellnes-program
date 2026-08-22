"""User and Member Dashboard Schemas."""

from datetime import datetime

from pydantic import BaseModel


class UserProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    timezone: str | None = None


class UserProfileResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    timezone: str
    roles: list[str]
    permissions: list[str]
    created_at: datetime


class MemberDashboardSummary(BaseModel):
    user_id: str
    full_name: str
    email: str
    active_program: str | None = None
    active_program_progress_percent: int = 0
    next_live_class: str | None = None
    next_live_class_time: datetime | None = None
    upcoming_bookings_count: int = 0
    meal_plan_week: int = 1
    recent_checkins_count: int = 0
