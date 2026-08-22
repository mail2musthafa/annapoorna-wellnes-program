"""Background email and notification jobs."""

import asyncio
import logging

from app.integrations.email.console import ConsoleEmailProvider
from app.integrations.email.interface import EmailMessage
from app.jobs.worker import celery_app

logger = logging.getLogger("annapoorna.jobs")


@celery_app.task(name="send_welcome_email", bind=True, max_retries=3)
def send_welcome_email(self, email: str, name: str):
    try:
        provider = ConsoleEmailProvider()
        msg = EmailMessage(
            to_email=email,
            subject="Welcome to Annapoorna Portal!",
            text_content=f"Namaste {name},\n\nWelcome to your holistic wellness journey across the Six Lifestyle Pillars.",
        )
        asyncio.run(provider.send_email(msg))
        return True
    except Exception as exc:
        logger.error(f"Failed to send welcome email to {email}: {exc}")
        raise self.retry(exc=exc, countdown=60) from exc


@celery_app.task(name="send_class_reminder", bind=True, max_retries=3)
def send_class_reminder(self, email: str, class_title: str, start_time_str: str, meeting_url: str):
    try:
        provider = ConsoleEmailProvider()
        msg = EmailMessage(
            to_email=email,
            subject=f"Reminder: {class_title} is starting soon",
            text_content=f"Your live class '{class_title}' starts at {start_time_str}.\nJoin here: {meeting_url}",
        )
        asyncio.run(provider.send_email(msg))
        return True
    except Exception as exc:
        logger.error(f"Failed to send class reminder to {email}: {exc}")
        raise self.retry(exc=exc, countdown=60) from exc
