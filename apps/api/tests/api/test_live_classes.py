"""Live Classes API & Booking Flow Tests."""

from datetime import UTC, datetime, timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import RoleName
from app.core.security import create_access_token, get_password_hash
from app.modules.live_classes.models import LiveClass
from app.modules.roles.models import Role, UserRole
from app.modules.users.models import User, UserProfile
from app.shared.enums import LiveClassStatus, UserStatus


@pytest.mark.asyncio
async def test_live_class_booking_flow_and_duplicate_prevention(client: AsyncClient, db_session: AsyncSession):
    # Fetch seeded member role
    res = await db_session.execute(select(Role).where(Role.name == RoleName.MEMBER.value))
    member_role = res.scalar_one()

    # 1. Setup Member User
    user = User(
        email="booker@annapoorna.wellness",
        hashed_password=get_password_hash("Pass12345!"),
        status=UserStatus.ACTIVE,
    )
    db_session.add(user)
    await db_session.flush()

    db_session.add(UserProfile(user_id=user.id, first_name="Booker", last_name="User"))
    db_session.add(UserRole(user_id=user.id, role_id=member_role.id))

    # 2. Setup Live Class
    live_class = LiveClass(
        title="Evening Pranayama & Meditation",
        slug="evening-pranayama-meditation",
        description="Relaxing evening breathwork.",
        start_time=datetime.now(UTC) + timedelta(days=1),
        end_time=datetime.now(UTC) + timedelta(days=1, hours=1),
        duration_minutes=60,
        capacity=20,
        meeting_url="https://meet.annapoorna.wellness/room-1",
        status=LiveClassStatus.SCHEDULED,
    )
    db_session.add(live_class)
    await db_session.commit()

    # 3. Authenticate as Member
    token = create_access_token(
        subject=str(user.id),
        roles=["Member"],
        permissions=["live_classes.book", "live_classes.read"],
    )
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Book Class Successfully
    book_res = await client.post(
        f"/api/v1/live-classes/{live_class.id}/book",
        headers=headers,
    )
    assert book_res.status_code in [200, 201]
    booking_data = book_res.json()
    assert booking_data["status"] == "confirmed"
    assert booking_data["live_class_id"] == str(live_class.id)

    # 5. Duplicate Booking Attempt -> Expect 409 Conflict
    dup_res = await client.post(
        f"/api/v1/live-classes/{live_class.id}/book",
        headers=headers,
    )
    assert dup_res.status_code == 409
