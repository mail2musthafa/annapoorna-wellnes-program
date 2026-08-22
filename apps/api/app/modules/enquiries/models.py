"""CRM, Leads, Enquiries, Activities, and Task Management Database Models."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Enquiry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Structured CRM enquiry / lead record.
    """
    __tablename__ = "enquiries"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), default="India", nullable=True)
    iana_timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata", nullable=False)

    enquiry_type: Mapped[str] = mapped_column(
        String(50), default="contact_form", nullable=False, index=True
    )  # contact_form, free_guide, discovery_call, class_enquiry, program_enquiry, nutrition_consultation, abandoned_cart, failed_payment
    interested_product: Mapped[str | None] = mapped_column(String(200), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Attribution
    source_page: Mapped[str | None] = mapped_column(String(255), nullable=True)
    campaign: Mapped[str | None] = mapped_column(String(100), nullable=True)
    marketing_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # CRM Stage & Assignment
    status: Mapped[str] = mapped_column(
        String(50), default="new", nullable=False, index=True
    )  # new, contacted, qualified, discovery_call_booked, follow_up_required, converted, not_interested, unresponsive, closed
    priority: Mapped[str] = mapped_column(
        String(20), default="normal", nullable=False, index=True
    )  # low, normal, high, urgent
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    assigned_staff_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    internal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    follow_up_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    conversion_value_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)

    activities: Mapped[list["LeadActivity"]] = relationship(
        "LeadActivity",
        back_populates="enquiry",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    tasks: Mapped[list["LeadTask"]] = relationship(
        "LeadTask",
        back_populates="enquiry",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class LeadActivity(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Audit timeline entry of enquiry interactions.
    """
    __tablename__ = "lead_activities"

    enquiry_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("enquiries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    actor_name: Mapped[str] = mapped_column(String(150), default="System", nullable=False)
    activity_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # status_change, note_added, email_sent, call_scheduled, payment_received
    summary: Mapped[str] = mapped_column(String(255), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)

    enquiry: Mapped["Enquiry"] = relationship("Enquiry", back_populates="activities")


class LeadTask(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Assigned follow-up task.
    """
    __tablename__ = "lead_tasks"

    enquiry_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("enquiries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    assigned_to_name: Mapped[str | None] = mapped_column(String(150), nullable=True)

    enquiry: Mapped["Enquiry"] = relationship("Enquiry", back_populates="tasks")
