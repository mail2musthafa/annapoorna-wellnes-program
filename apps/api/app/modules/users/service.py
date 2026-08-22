"""User Profile and Member Dashboard Service."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException
from app.modules.live_classes.models import LiveClassBooking
from app.modules.programs.models import ProgramEnrollment
from app.modules.roles.models import Role
from app.modules.users.models import User
from app.modules.users.schemas import MemberDashboardSummary, UserProfileResponse
from app.shared.enums import BookingStatus, EnrollmentStatus


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user_id: uuid.UUID) -> UserProfileResponse:
        query = (
            select(User)
            .options(
                selectinload(User.profile),
                selectinload(User.roles).selectinload(Role.permissions),
            )
            .where(User.id == user_id, User.is_deleted.is_(False))
        )
        res = await self.db.execute(query)
        user = res.scalar_one_or_none()
        if not user:
            raise NotFoundException("User", user_id)

        roles = [r.name for r in user.roles]
        permissions = list({p.code for r in user.roles for p in r.permissions})

        return UserProfileResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.profile.first_name if user.profile else "",
            last_name=user.profile.last_name if user.profile else "",
            phone=user.profile.phone if user.profile else None,
            avatar_url=user.profile.avatar_url if user.profile else None,
            bio=user.profile.bio if user.profile else None,
            timezone=user.profile.timezone if user.profile else "UTC",
            roles=roles,
            permissions=permissions,
            created_at=user.created_at,
        )

    async def get_member_dashboard(self, user_id: uuid.UUID) -> MemberDashboardSummary:
        profile = await self.get_profile(user_id)

        # Find active program
        enrollment_query = (
            select(ProgramEnrollment)
            .options(selectinload(ProgramEnrollment.program))
            .where(
                ProgramEnrollment.user_id == user_id,
                ProgramEnrollment.status == EnrollmentStatus.ACTIVE,
            )
            .order_by(ProgramEnrollment.created_at.desc())
        )
        enr_res = await self.db.execute(enrollment_query)
        enrollment = enr_res.scalar_one_or_none()
        active_program_title = enrollment.program.title if enrollment and enrollment.program else None

        # Find next upcoming booked live class
        booking_query = (
            select(LiveClassBooking)
            .options(selectinload(LiveClassBooking.live_class))
            .where(
                LiveClassBooking.user_id == user_id,
                LiveClassBooking.status == BookingStatus.CONFIRMED,
            )
            .order_by(LiveClassBooking.created_at.desc())
        )
        book_res = await self.db.execute(booking_query)
        booking = book_res.scalar_one_or_none()
        next_class_title = booking.live_class.title if booking and booking.live_class else None
        next_class_time = booking.live_class.start_time if booking and booking.live_class else None

        # Count total bookings
        count_bookings_query = select(func.count()).select_from(
            select(LiveClassBooking)
            .where(
                LiveClassBooking.user_id == user_id,
                LiveClassBooking.status == BookingStatus.CONFIRMED,
            )
            .subquery()
        )
        bookings_count = (await self.db.execute(count_bookings_query)).scalar_one()

        return MemberDashboardSummary(
            user_id=str(user_id),
            full_name=f"{profile.first_name} {profile.last_name}".strip() or profile.email,
            email=profile.email,
            active_program=active_program_title,
            active_program_progress_percent=25 if active_program_title else 0,
            next_live_class=next_class_title,
            next_live_class_time=next_class_time,
            upcoming_bookings_count=bookings_count,
            meal_plan_week=1,
            recent_checkins_count=0,
        )
