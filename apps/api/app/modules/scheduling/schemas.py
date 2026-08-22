"""Schemas for Scheduling, Class Sessions, Seat Holds, and Availability."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InstructorProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    display_name: str
    headline: str
    bio: str
    avatar_url: str | None = None
    iana_timezone: str


class ClassSessionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    title: str
    slug: str
    description: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    iana_timezone: str
    capacity: int
    confirmed_count: int
    held_count: int
    available_seats: int
    status: str
    price_usd_cents: int = 2500
    price_inr_paise: int = 199900
    instructor_name: str | None = None


class HoldSeatRequest(BaseModel):
    session_id: uuid.UUID
    seats: int = Field(default=1, ge=1, le=5)
    guest_token: str | None = None


class HoldSeatResponse(BaseModel):
    seat_hold_id: uuid.UUID
    session_id: uuid.UUID
    seats_held: int
    expires_at: datetime
    seconds_remaining: int


class JoinWaitlistRequest(BaseModel):
    session_id: uuid.UUID


class WaitlistResponse(BaseModel):
    waitlist_id: uuid.UUID
    session_id: uuid.UUID
    position: int
    message: str
