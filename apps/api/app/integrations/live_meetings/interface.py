"""Live Meeting Provider SPI Interface."""

from abc import ABC, abstractmethod
from datetime import datetime

from pydantic import BaseModel


class MeetingDetails(BaseModel):
    meeting_id: str
    join_url: str
    host_url: str
    password: str | None = None


class MeetingProvider(ABC):
    @abstractmethod
    async def create_meeting(
        self,
        topic: str,
        start_time: datetime,
        duration_minutes: int,
    ) -> MeetingDetails:
        """Create a virtual live meeting."""
        pass
