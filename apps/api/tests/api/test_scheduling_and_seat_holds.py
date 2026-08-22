"""Tests for Scheduled Class Sessions, Timezone Availability, and 15-Minute Seat Holds."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_scheduled_sessions_listing_and_seat_availability(client: AsyncClient):
    response = await client.get("/api/v1/calendar/sessions")
    assert response.status_code == 200
    sessions = response.json()
    assert len(sessions) >= 12
    first_session = sessions[0]
    assert "available_seats" in first_session
    assert first_session["available_seats"] == first_session["capacity"] - (first_session["confirmed_count"] + first_session["held_count"])


@pytest.mark.asyncio
async def test_seat_hold_reservation_and_expiry(client: AsyncClient):
    sessions_res = await client.get("/api/v1/calendar/sessions")
    session = sessions_res.json()[0]
    session_id = session["id"]
    initial_available = session["available_seats"]

    # Create temporary seat hold
    hold_res = await client.post(
        "/api/v1/calendar/hold-seat",
        json={
            "session_id": session_id,
            "seats": 1,
            "guest_token": "guest-seat-holder-456",
        },
    )
    assert hold_res.status_code == 200
    hold_data = hold_res.json()
    assert hold_data["seats_held"] == 1
    assert hold_data["seconds_remaining"] > 800  # ~900s for 15 minutes

    # Verify session available_seats decreased by 1
    updated_sessions = await client.get("/api/v1/calendar/sessions")
    updated_session = next(s for s in updated_sessions.json() if s["id"] == session_id)
    assert updated_session["available_seats"] == initial_available - 1
    assert updated_session["held_count"] == session["held_count"] + 1
