"""CRM, Lead Capture, and Enquiry Management API Router."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import UserContext
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context, get_optional_user_context
from app.modules.enquiries.schemas import (
    AddEnquiryTaskRequest,
    CreateEnquiryRequest,
    EnquirySchema,
    UpdateEnquiryStatusRequest,
)
from app.modules.enquiries.service import EnquiryService

router = APIRouter(prefix="/enquiries", tags=["CRM & Enquiries"])


@router.post("", response_model=EnquirySchema, status_code=status.HTTP_201_CREATED, summary="Submit a new enquiry or lead capture")
async def create_enquiry(
    req: CreateEnquiryRequest,
    db: AsyncSession = Depends(get_db),
):
    service = EnquiryService(db)
    return await service.create_enquiry(req)


@router.get("", response_model=list[EnquirySchema], summary="List all CRM enquiries with pipeline filters (Admin / Staff)")
async def list_enquiries(
    status: str | None = Query(None, description="Filter by status (new, contacted, qualified, converted, etc.)"),
    priority: str | None = Query(None, description="Filter by priority (low, normal, high, urgent)"),
    enquiry_type: str | None = Query(None, description="Filter by enquiry type"),
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = EnquiryService(db)
    return await service.list_enquiries(status=status, priority=priority, enquiry_type=enquiry_type)


@router.patch("/{enquiry_id}/status", response_model=EnquirySchema, summary="Update enquiry stage, assigned staff, notes, or follow-up date")
async def update_enquiry_status(
    enquiry_id: uuid.UUID,
    req: UpdateEnquiryStatusRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = EnquiryService(db)
    return await service.update_enquiry_status(enquiry_id=enquiry_id, req=req, actor_name=user_context.email)


@router.post("/{enquiry_id}/tasks", response_model=EnquirySchema, summary="Schedule a follow-up task for an enquiry")
async def add_enquiry_task(
    enquiry_id: uuid.UUID,
    req: AddEnquiryTaskRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = EnquiryService(db)
    return await service.add_task(enquiry_id=enquiry_id, req=req)
