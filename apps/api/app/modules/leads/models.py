"""Leads, Lead Magnets, and Discovery Calls Database Models."""

import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.shared.enums import LeadStatus


class Lead(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "leads"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default=LeadStatus.NEW, nullable=False, index=True)
    source: Mapped[str | None] = mapped_column(String(100), default="website", nullable=True)
    campaign: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    consent_marketing: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    downloads: Mapped[list["LeadMagnetDownload"]] = relationship("LeadMagnetDownload", back_populates="lead")


class LeadMagnet(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "lead_magnets"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    download_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class LeadMagnetDownload(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "lead_magnet_downloads"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    magnet_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("lead_magnets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    lead: Mapped["Lead"] = relationship("Lead", back_populates="downloads")
    magnet: Mapped["LeadMagnet"] = relationship("LeadMagnet")


class DiscoveryCallRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "discovery_call_requests"

    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("leads.id", ondelete="SET NULL"),
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    primary_goal: Mapped[str] = mapped_column(Text, nullable=False)
    preferred_time: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
