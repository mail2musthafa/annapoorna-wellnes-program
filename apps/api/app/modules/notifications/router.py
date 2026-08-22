"""Notifications API Router."""

import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import UserContext
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context
from app.modules.notifications.models import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    action_url: str | None = None
    is_read: bool


@router.get("", response_model=list[NotificationItem], summary="Get current user notifications")
async def get_my_notifications(
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Notification)
        .where(Notification.user_id == uuid.UUID(user_context.user_id))
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    notes = res.scalars().all()
    return [
        NotificationItem(
            id=str(n.id),
            title=n.title,
            message=n.message,
            notification_type=n.notification_type,
            action_url=n.action_url,
            is_read=n.is_read,
        )
        for n in notes
    ]
