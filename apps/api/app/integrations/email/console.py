"""Console and Development Email Provider."""

import logging

from app.integrations.email.interface import EmailMessage, EmailProvider

logger = logging.getLogger("annapoorna.email")


class ConsoleEmailProvider(EmailProvider):
    async def send_email(self, message: EmailMessage) -> bool:
        logger.info(
            f"\n--- [EMAIL OUTBOX] ---\nTo: {message.to_email}\nSubject: {message.subject}\nContent:\n{message.text_content}\n-----------------------"
        )
        return True
