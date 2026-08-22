"""User Dashboard API Tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import RoleName
from app.core.security import create_access_token, get_password_hash
from app.modules.roles.models import Role, UserRole
from app.modules.users.models import User, UserProfile
from app.shared.enums import UserStatus


@pytest.mark.asyncio
async def test_member_dashboard_authenticated_access(client: AsyncClient, db_session: AsyncSession):
    # Fetch seeded member role
    res = await db_session.execute(select(Role).where(Role.name == RoleName.MEMBER.value))
    member_role = res.scalar_one()

    # Setup Member User
    user = User(
        email="dashboard.member@annapoorna.wellness",
        hashed_password=get_password_hash("MemberPass123!"),
        status=UserStatus.ACTIVE,
    )
    db_session.add(user)
    await db_session.flush()

    db_session.add(UserProfile(user_id=user.id, first_name="Dashboard", last_name="User"))
    db_session.add(UserRole(user_id=user.id, role_id=member_role.id))
    await db_session.commit()

    token = create_access_token(
        subject=str(user.id),
        roles=["Member"],
        permissions=["users.read", "programs.read", "live_classes.read"],
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Access Protected Dashboard
    dash_res = await client.get("/api/v1/users/me/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["email"] == "dashboard.member@annapoorna.wellness"
    assert dash_data["full_name"] == "Dashboard User"
    assert "meal_plan_week" in dash_data
