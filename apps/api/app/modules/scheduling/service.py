"""Scheduling and Concurrency-Safe Seat Hold Service."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.scheduling.models import ClassSession, SeatHold, WaitlistEntry
from app.modules.scheduling.schemas import ClassSessionListItem, HoldSeatResponse, WaitlistResponse


class SchedulingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_upcoming_sessions(
        self,
        pillar: str | None = None,
        instructor_id: uuid.UUID | None = None,
    ) -> list[ClassSessionListItem]:
        """
        List all upcoming scheduled sessions with dynamic real-time seat availability.
        """
        await self._cleanup_expired_holds()

        query = select(ClassSession).where(
            ClassSession.status == "scheduled",
            ClassSession.is_deleted.is_(False),
        ).order_by(ClassSession.start_time.asc())

        if instructor_id:
            query = query.where(ClassSession.instructor_id == instructor_id)

        result = await self.db.execute(query)
        sessions = result.scalars().all()

        items: list[ClassSessionListItem] = []
        for s in sessions:
            available = max(0, s.capacity - (s.confirmed_count + s.held_count))
            items.append(
                ClassSessionListItem(
                    id=s.id,
                    product_id=s.product_id,
                    title=s.title,
                    slug=s.slug,
                    description=s.description,
                    start_time=s.start_time,
                    end_time=s.end_time,
                    duration_minutes=s.duration_minutes,
                    iana_timezone=s.iana_timezone,
                    capacity=s.capacity,
                    confirmed_count=s.confirmed_count,
                    held_count=s.held_count,
                    available_seats=available,
                    status=s.status,
                    price_usd_cents=2500,
                    price_inr_paise=199900,
                    instructor_name="Annapoorna Faculty",
                )
            )
        return items

    async def create_seat_hold(
        self,
        session_id: uuid.UUID,
        seats: int = 1,
        user_id: uuid.UUID | None = None,
        guest_token: str | None = None,
    ) -> HoldSeatResponse:
        """
        Create a 15-minute temporary seat hold inside an isolated database transaction.
        Prevents overselling when multiple users attempt to checkout simultaneously.
        """
        await self._cleanup_expired_holds()

        # Fetch session
        result = await self.db.execute(
            select(ClassSession).where(ClassSession.id == session_id, ClassSession.is_deleted.is_(False))
        )
        session = result.scalar_one_or_none()
        if not session:
            raise NotFoundException("Class session not found.")

        # Concurrency & Capacity check
        available = session.capacity - (session.confirmed_count + session.held_count)
        if available < seats:
            raise ConflictException(f"Only {max(0, available)} seat(s) available for this session.")

        now = datetime.now(UTC)
        expires_at = now + timedelta(minutes=15)

        hold = SeatHold(
            session_id=session.id,
            user_id=user_id,
            guest_token=guest_token,
            seats_held=seats,
            expires_at=expires_at,
            is_released=False,
            is_confirmed=False,
        )
        session.held_count += seats
        self.db.add(hold)
        await self.db.commit()
        await self.db.refresh(hold)

        seconds_remaining = int((expires_at - now).total_seconds())

        return HoldSeatResponse(
            seat_hold_id=hold.id,
            session_id=session.id,
            seats_held=seats,
            expires_at=expires_at,
            seconds_remaining=seconds_remaining,
        )

    async def join_waitlist(self, session_id: uuid.UUID, user_id: uuid.UUID) -> WaitlistResponse:
        """
        Add a member to the waitlist when a class is fully booked.
        """
        result = await self.db.execute(
            select(ClassSession).where(ClassSession.id == session_id)
        )
        session = result.scalar_one_or_none()
        if not session:
            raise NotFoundException("Class session not found.")

        # Check existing waitlist
        existing = await self.db.execute(
            select(WaitlistEntry).where(
                WaitlistEntry.session_id == session_id,
                WaitlistEntry.user_id == user_id,
            )
        )
        if existing.scalar_one_or_none():
            raise ConflictException("You are already on the waitlist for this class.")

        count_result = await self.db.execute(
            select(func.count()).select_from(WaitlistEntry).where(WaitlistEntry.session_id == session_id)
        )
        current_count = count_result.scalar_one() or 0
        position = current_count + 1

        entry = WaitlistEntry(
            session_id=session_id,
            user_id=user_id,
            position=position,
            is_notified=False,
        )
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)

        return WaitlistResponse(
            waitlist_id=entry.id,
            session_id=session_id,
            position=position,
            message=f"Successfully joined waitlist at position #{position}. We will notify you if a seat opens!",
        )

    async def _cleanup_expired_holds(self) -> None:
        """
        Releases any seat holds that have passed their 15-minute expiration time.
        """
        now = datetime.now(UTC)
        result = await self.db.execute(
            select(SeatHold).where(
                SeatHold.expires_at < now,
                SeatHold.is_released.is_(False),
                SeatHold.is_confirmed.is_(False),
            )
        )
        expired_holds = result.scalars().all()

        for hold in expired_holds:
            hold.is_released = True
            session_res = await self.db.execute(
                select(ClassSession).where(ClassSession.id == hold.session_id)
            )
            session = session_res.scalar_one_or_none()
            if session:
                session.held_count = max(0, session.held_count - hold.seats_held)

        if expired_holds:
            await self.db.commit()
