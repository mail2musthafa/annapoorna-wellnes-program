"""Authentication API Tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient, db_session: AsyncSession):
    # 1. Register new member
    reg_payload = {
        "email": "tester@annapoorna.wellness",
        "password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "Member",
        "terms_accepted": True,
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "tester@annapoorna.wellness"
    assert "Member" in data["user"]["roles"]

    # 2. Duplicate registration rejection
    dup_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 409

    # 3. Login with correct credentials
    login_payload = {
        "email": "tester@annapoorna.wellness",
        "password": "SecurePassword123!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 4. Login with invalid password
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "tester@annapoorna.wellness", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401
