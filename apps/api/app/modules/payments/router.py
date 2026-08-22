"""Payments, Webhooks, and Order Settlement API Router."""

import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.permissions import UserContext
from app.db.session import get_db
from app.integrations.payments.interface import CheckoutSessionRequest
from app.integrations.payments.mock import MockPaymentGateway
from app.modules.auth.dependencies import get_current_user_context
from app.modules.commerce.models import Invoice, Order
from app.modules.memberships.models import Entitlement
from app.modules.payments.models import Payment, PaymentWebhookEvent
from app.modules.scheduling.models import ClassSession, SeatHold
from app.shared.enums import PaymentStatus
from app.shared.utils import utc_now

router = APIRouter(prefix="/payments", tags=["Payments & Webhooks"])


class CreateCheckoutRequest(BaseModel):
    product_type: str
    product_id: str
    product_name: str
    amount_cents: int
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    session_id: str
    checkout_url: str


class CompleteOrderPaymentRequest(BaseModel):
    order_id: uuid.UUID
    payment_method: str = "card"


@router.post(
    "/checkout",
    response_model=CheckoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Create hosted checkout session",
)
async def create_checkout(
    req: CreateCheckoutRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    gateway = MockPaymentGateway()
    session_req = CheckoutSessionRequest(
        user_id=user_context.user_id,
        email=user_context.email,
        amount_cents=req.amount_cents,
        product_name=req.product_name,
        product_type=req.product_type,
        product_id=req.product_id,
        success_url=req.success_url,
        cancel_url=req.cancel_url,
    )
    res = await gateway.create_checkout_session(session_req)
    return CheckoutResponse(session_id=res.session_id, checkout_url=res.checkout_url)


@router.post(
    "/orders/{order_id}/complete",
    status_code=status.HTTP_200_OK,
    summary="Complete order payment, confirm seat holds, and provision entitlements",
)
async def complete_order_payment(
    order_id: uuid.UUID,
    req: CompleteOrderPaymentRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, order_id)
    if not order:
        raise NotFoundException("Order not found.")

    if order.status == "paid":
        return {"status": "already_paid", "order_id": str(order.id), "order_number": order.order_number}

    now = datetime.now(UTC)
    order.status = "paid"
    order.paid_at = now
    order.provider_payment_id = f"pay_{uuid.uuid4().hex[:12]}"

    payment = Payment(
        user_id=order.user_id,
        amount_cents=order.total_minor if order.currency == "USD" else (order.total_minor // 100),
        currency=order.currency,
        status=PaymentStatus.SUCCEEDED,
        provider=order.payment_provider or "mock",
        provider_payment_id=order.provider_payment_id,
        payment_type="cart_checkout",
        product_id=str(order.id),
    )
    db.add(payment)

    # Create Invoice
    invoice = Invoice(
        invoice_number=f"INV-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
        order_id=order.id,
        user_id=order.user_id,
        amount_minor=order.total_minor,
        currency=order.currency,
        status="paid",
        download_url=f"/invoices/{order.id}.pdf",
    )
    db.add(invoice)

    # Process each order item: confirm seat holds, create bookings & entitlements
    # 3. Create Entitlements and confirm bookings
    for item in order.items:
        entitlement = Entitlement(
            user_id=order.user_id,
            entitlement_type=item.product_type,
            resource_type=item.product_type,
            resource_id=str(item.product_id),
            is_active=True,
            expires_at=now + timedelta(days=365),
        )
        db.add(entitlement)

        # If it's a scheduled class session, confirm seat hold & increment confirmed_count
        if item.session_id:
            sess_res = await db.execute(select(ClassSession).where(ClassSession.id == item.session_id))
            session = sess_res.scalar_one_or_none()
            if session:
                session.confirmed_count += item.quantity
                session.held_count = max(0, session.held_count - item.quantity)

            # Mark seat hold as confirmed
            hold_res = await db.execute(
                select(SeatHold).where(
                    SeatHold.session_id == item.session_id,
                    SeatHold.user_id == order.user_id,
                    SeatHold.is_released.is_(False),
                )
            )
            seat_hold = hold_res.scalar_one_or_none()
            if seat_hold:
                seat_hold.is_confirmed = True

    await db.commit()
    await db.refresh(order)

    return {
        "status": "paid",
        "order_id": str(order.id),
        "order_number": order.order_number,
        "amount_minor": order.total_minor,
        "currency": order.currency,
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
    }


@router.post(
    "/webhook/{provider}",
    status_code=status.HTTP_200_OK,
    summary="Idempotent payment webhook processor",
)
async def process_payment_webhook(
    provider: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    body = await request.body()
    headers = dict(request.headers)

    gateway = MockPaymentGateway()
    verification = await gateway.verify_webhook(body, headers)

    if not verification.is_valid:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    # Idempotency check
    existing = await db.execute(
        select(PaymentWebhookEvent).where(
            PaymentWebhookEvent.provider == provider,
            PaymentWebhookEvent.provider_event_id == verification.event_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"status": "ignored", "reason": "duplicate_event"}

    webhook_event = PaymentWebhookEvent(
        provider=provider,
        provider_event_id=verification.event_id,
        event_type=verification.event_type,
        payload=verification.payload,
        is_processed=True,
        processed_at=utc_now(),
    )
    db.add(webhook_event)
    await db.commit()

    return {"status": "processed", "event_id": verification.event_id}
