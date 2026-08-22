"""Mock Meeting Provider for local development."""

import uuid
from datetime import datetime

from app.integrations.live_meetings.interface import MeetingDetails, MeetingProvider


class MockMeetingProvider(MeetingProvider):
    async def create_meeting(
        self,
        topic: str,
        start_time: datetime,
        duration_minutes: int,
    ) -> MeetingDetails:
        meeting_id = f"mock-meet-{uuid.uuid4().hex[:8]}"
        return MeetingDetails(
            meeting_id=meeting_id,
            join_url=f"https://meet.annapoorna.wellness/room/{meeting_id}",
            host_url=f"https://meet.annapoorna.wellness/host/{meeting_id}",
            password="wellness-pass",
        )
