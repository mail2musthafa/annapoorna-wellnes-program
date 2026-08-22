"""Payments, Invoices, Webhook Events, and Coupons Database Models."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.shared.enums import PaymentStatus

if TYPE_CHECKING:
    from app.modules.users.models import User


class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payments"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_payment_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=PaymentStatus.PENDING, nullable=False, index=True)
    payment_type: Mapped[str] = mapped_column(String(50), nullable=False)
    product_id: Mapped[str] = mapped_column(String(100), nullable=False)
    receipt_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship("User")


class PaymentWebhookEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payment_webhook_events"
    __table_args__ = (
        UniqueConstraint("provider", "provider_event_id", name="uq_provider_event_id"),
    )

    provider: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    provider_event_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    is_processed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)


class Coupon(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "coupons"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    discount_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)
    discount_amount_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_redemptions: Mapped[int | None] = mapped_column(Integer, nullable=True)
    current_redemptions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
