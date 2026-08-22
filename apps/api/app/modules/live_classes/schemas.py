"""Live Classes Schemas."""

from datetime import datetime

from pydantic import BaseModel


class LiveClassListItem(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    timezone: str
    capacity: int
    current_bookings_count: int
    spots_remaining: int
    status: str
    is_booked_by_me: bool = False


class LiveClassDetail(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    timezone: str
    capacity: int
    current_bookings_count: int
    status: str
    meeting_url: str | None = None  # Only populated if booked
    recording_url: str | None = None
    is_booked_by_me: bool = False


class BookingResponse(BaseModel):
    booking_id: str
    live_class_id: str
    status: str
    meeting_url: str | None = None
    message: str
