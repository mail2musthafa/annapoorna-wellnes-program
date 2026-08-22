"""CRM Enquiries, Lead Management, and Timeline Activities Business Logic Service."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.modules.enquiries.models import Enquiry, LeadActivity, LeadTask
from app.modules.enquiries.schemas import (
    AddEnquiryTaskRequest,
    CreateEnquiryRequest,
    EnquirySchema,
    UpdateEnquiryStatusRequest,
)


class EnquiryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_enquiry(self, req: CreateEnquiryRequest) -> EnquirySchema:
        enquiry = Enquiry(
            first_name=req.first_name,
            last_name=req.last_name,
            email=req.email,
            phone=req.phone,
            country=req.country,
            enquiry_type=req.enquiry_type,
            interested_product=req.interested_product,
            message=req.message,
            source_page=req.source_page,
            marketing_consent=req.marketing_consent,
            status="new",
            priority="normal",
        )
        self.db.add(enquiry)
        await self.db.flush()

        # Log initial creation activity
        activity = LeadActivity(
            enquiry_id=enquiry.id,
            actor_name="System Ingestion",
            activity_type="enquiry_created",
            summary=f"New {req.enquiry_type.replace('_', ' ').title()} submitted by {req.first_name} ({req.email})",
            details=req.message,
        )
        self.db.add(activity)

        await self.db.commit()
        await self.db.refresh(enquiry)
        return EnquirySchema.model_validate(enquiry)

    async def list_enquiries(
        self,
        status: str | None = None,
        priority: str | None = None,
        enquiry_type: str | None = None,
    ) -> list[EnquirySchema]:
        query = select(Enquiry).order_by(Enquiry.created_at.desc())

        if status:
            query = query.where(Enquiry.status == status)
        if priority:
            query = query.where(Enquiry.priority == priority)
        if enquiry_type:
            query = query.where(Enquiry.enquiry_type == enquiry_type)

        result = await self.db.execute(query)
        enquiries = result.scalars().all()
        return [EnquirySchema.model_validate(e) for e in enquiries]

    async def update_enquiry_status(
        self,
        enquiry_id: uuid.UUID,
        req: UpdateEnquiryStatusRequest,
        actor_name: str = "Admin Staff",
    ) -> EnquirySchema:
        enquiry = await self.db.get(Enquiry, enquiry_id)
        if not enquiry:
            raise NotFoundException("Enquiry record not found.")

        old_status = enquiry.status
        enquiry.status = req.status
        if req.priority:
            enquiry.priority = req.priority
        if req.assigned_staff_name:
            enquiry.assigned_staff_name = req.assigned_staff_name
        if req.internal_notes:
            enquiry.internal_notes = req.internal_notes
        if req.follow_up_date:
            enquiry.follow_up_date = req.follow_up_date

        # Log status transition activity
        activity = LeadActivity(
            enquiry_id=enquiry.id,
            actor_name=actor_name,
            activity_type="status_change",
            summary=f"Status transitioned from '{old_status}' to '{req.status}'",
            details=f"Notes: {req.internal_notes}" if req.internal_notes else None,
        )
        self.db.add(activity)

        await self.db.commit()
        await self.db.refresh(enquiry)
        return EnquirySchema.model_validate(enquiry)

    async def add_task(self, enquiry_id: uuid.UUID, req: AddEnquiryTaskRequest) -> EnquirySchema:
        enquiry = await self.db.get(Enquiry, enquiry_id)
        if not enquiry:
            raise NotFoundException("Enquiry record not found.")

        task = LeadTask(
            enquiry_id=enquiry.id,
            title=req.title,
            due_date=req.due_date,
            is_completed=False,
            assigned_to_name=req.assigned_to_name or enquiry.assigned_staff_name,
        )
        self.db.add(task)

        activity = LeadActivity(
            enquiry_id=enquiry.id,
            actor_name="CRM Scheduler",
            activity_type="task_scheduled",
            summary=f"Scheduled task: '{req.title}' due on {req.due_date.strftime('%b %d, %Y')}",
        )
        self.db.add(activity)

        await self.db.commit()
        await self.db.refresh(enquiry)
        return EnquirySchema.model_validate(enquiry)
