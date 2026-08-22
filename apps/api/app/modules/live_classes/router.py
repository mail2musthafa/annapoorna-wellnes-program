"""Live Classes API Router."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import PermissionCode
from app.core.permissions import UserContext, require_permission
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context, get_optional_user_context
from app.modules.live_classes.schemas import (
    BookingResponse,
    LiveClassListItem,
)
from app.modules.live_classes.service import LiveClassService

router = APIRouter(prefix="/live-classes", tags=["Live Classes"])


@router.get(
    "",
    response_model=list[LiveClassListItem],
    summary="List upcoming live classes and workshops",
)
async def list_live_classes(
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = LiveClassService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else None
    return await service.list_upcoming_classes(current_user_id=user_id)


@router.post(
    "/{class_id}/book",
    response_model=BookingResponse,
    status_code=status.HTTP_200_OK,
    summary="Book a live class for authenticated member",
)
async def book_live_class(
    class_id: str,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    require_permission(PermissionCode.LIVE_CLASSES_BOOK)(user_context)
    service = LiveClassService(db)
    return await service.book_class(
        live_class_id=uuid.UUID(class_id),
        user_id=uuid.UUID(user_context.user_id),
    )
