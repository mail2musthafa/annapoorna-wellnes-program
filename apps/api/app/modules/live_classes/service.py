"""Live Class Service with Booking and Duplicate Prevention."""

import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.live_classes.models import LiveClass, LiveClassBooking
from app.modules.live_classes.schemas import (
    BookingResponse,
    LiveClassListItem,
)
from app.shared.enums import BookingStatus, LiveClassStatus


class LiveClassService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_upcoming_classes(self, current_user_id: uuid.UUID | None = None) -> list[LiveClassListItem]:
        query = (
            select(LiveClass)
            .where(
                LiveClass.is_deleted.is_(False),
                LiveClass.status.in_([LiveClassStatus.SCHEDULED, LiveClassStatus.IN_PROGRESS]),
            )
            .order_by(LiveClass.start_time.asc())
        )
        result = await self.db.execute(query)
        classes = result.scalars().all()

        user_booked_class_ids = set()
        if current_user_id:
            booking_query = select(LiveClassBooking.live_class_id).where(
                LiveClassBooking.user_id == current_user_id,
                LiveClassBooking.status == BookingStatus.CONFIRMED,
            )
            booking_res = await self.db.execute(booking_query)
            user_booked_class_ids = set(booking_res.scalars().all())

        return [
            LiveClassListItem(
                id=str(c.id),
                title=c.title,
                slug=c.slug,
                description=c.description,
                start_time=c.start_time,
                end_time=c.end_time,
                duration_minutes=c.duration_minutes,
                timezone=c.timezone,
                capacity=c.capacity,
                current_bookings_count=c.current_bookings_count,
                spots_remaining=max(0, c.capacity - c.current_bookings_count),
                status=c.status,
                is_booked_by_me=c.id in user_booked_class_ids,
            )
            for c in classes
        ]

    async def book_class(self, live_class_id: uuid.UUID, user_id: uuid.UUID) -> BookingResponse:
        # Fetch class with row locking / check capacity
        live_class = await self.db.get(LiveClass, live_class_id)
        if not live_class or live_class.is_deleted:
            raise NotFoundException("LiveClass", live_class_id)

        # Check existing booking
        existing_booking = await self.db.execute(
            select(LiveClassBooking).where(
                LiveClassBooking.live_class_id == live_class_id,
                LiveClassBooking.user_id == user_id,
            )
        )
        existing = existing_booking.scalar_one_or_none()
        if existing and existing.status == BookingStatus.CONFIRMED:
            raise ConflictException("You have already booked this live class.")

        # Check capacity
        if live_class.current_bookings_count >= live_class.capacity:
            raise ConflictException("This live class is already at full capacity.")

        try:
            if existing:
                existing.status = BookingStatus.CONFIRMED
                booking = existing
            else:
                booking = LiveClassBooking(
                    live_class_id=live_class_id,
                    user_id=user_id,
                    status=BookingStatus.CONFIRMED,
                )
                self.db.add(booking)

            live_class.current_bookings_count += 1
            await self.db.commit()
            await self.db.refresh(booking)
        except IntegrityError as e:
            await self.db.rollback()
            raise ConflictException("You have already booked this live class.") from e

        return BookingResponse(
            booking_id=str(booking.id),
            live_class_id=str(live_class.id),
            status=booking.status,
            meeting_url=live_class.meeting_url,
            message="Successfully booked! Meeting link is now active.",
        )
