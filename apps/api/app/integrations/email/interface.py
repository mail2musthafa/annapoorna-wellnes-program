"""Email Service SPI Interface."""

from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel, EmailStr


class EmailMessage(BaseModel):
    to_email: EmailStr
    subject: str
    text_content: str
    html_content: str | None = None
    template_id: str | None = None
    template_data: dict[str, Any] | None = None


class EmailProvider(ABC):
    @abstractmethod
    async def send_email(self, message: EmailMessage) -> bool:
        """Send an email message asynchronously."""
        pass
