"""Mock Payment Gateway implementation for local development and testing."""

import json
import uuid

from app.integrations.payments.interface import (
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    PaymentGateway,
    WebhookVerificationResult,
)


class MockPaymentGateway(PaymentGateway):
    async def create_checkout_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        session_id = f"mock_sess_{uuid.uuid4().hex[:12]}"
        checkout_url = f"{request.success_url}?session_id={session_id}&mock=true"
        return CheckoutSessionResponse(
            session_id=session_id,
            checkout_url=checkout_url,
            provider="mock",
        )

    async def verify_webhook(self, raw_body: bytes, headers: dict[str, str]) -> WebhookVerificationResult:
        try:
            data = json.loads(raw_body.decode("utf-8"))
            return WebhookVerificationResult(
                is_valid=True,
                event_id=data.get("id", f"mock_evt_{uuid.uuid4().hex[:8]}"),
                event_type=data.get("type", "checkout.session.completed"),
                payload=data,
            )
        except Exception as e:
            return WebhookVerificationResult(
                is_valid=False,
                event_id="unknown",
                event_type="unknown",
                payload={},
                error_message=str(e),
            )

    async def refund_payment(self, payment_id: str, amount_cents: int | None = None) -> bool:
        return True
