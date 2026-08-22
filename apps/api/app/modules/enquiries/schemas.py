"""CRM, Lead Enquiries, and Timeline Activity Pydantic Schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class LeadActivitySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    actor_name: str
    activity_type: str
    summary: str
    details: str | None = None
    created_at: datetime


class LeadTaskSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    due_date: datetime
    is_completed: bool
    assigned_to_name: str | None = None


class EnquirySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    first_name: str
    last_name: str | None = None
    email: str
    phone: str | None = None
    country: str | None = "India"
    iana_timezone: str = "Asia/Kolkata"
    enquiry_type: str
    interested_product: str | None = None
    message: str | None = None
    status: str
    priority: str
    assigned_staff_name: str | None = None
    internal_notes: str | None = None
    follow_up_date: datetime | None = None
    conversion_value_minor: int | None = None
    created_at: datetime
    activities: list[LeadActivitySchema] = []
    tasks: list[LeadTaskSchema] = []


class CreateEnquiryRequest(BaseModel):
    first_name: str
    last_name: str | None = None
    email: EmailStr
    phone: str | None = None
    country: str | None = "India"
    enquiry_type: str = "contact_form"  # contact_form, free_guide, discovery_call, class_enquiry, program_enquiry
    interested_product: str | None = None
    message: str | None = None
    source_page: str | None = None
    marketing_consent: bool = True


class UpdateEnquiryStatusRequest(BaseModel):
    status: str  # new, contacted, qualified, discovery_call_booked, follow_up_required, converted, not_interested
    priority: str | None = None
    assigned_staff_name: str | None = None
    internal_notes: str | None = None
    follow_up_date: datetime | None = None


class AddEnquiryTaskRequest(BaseModel):
    title: str
    due_date: datetime
    assigned_to_name: str | None = None
