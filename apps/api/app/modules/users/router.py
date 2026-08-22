"""User and Profile API Router."""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import UserContext
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context
from app.modules.users.schemas import MemberDashboardSummary, UserProfileResponse
from app.modules.users.service import UserService

router = APIRouter(prefix="/users", tags=["Users & Member Profile"])


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile and permission details",
)
async def get_my_profile(
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    return await service.get_profile(uuid.UUID(user_context.user_id))


@router.get(
    "/me/dashboard",
    response_model=MemberDashboardSummary,
    summary="Get authenticated member dashboard summary data",
)
async def get_my_dashboard(
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    return await service.get_member_dashboard(uuid.UUID(user_context.user_id))
