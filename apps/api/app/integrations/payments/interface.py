"""Payment Gateway SPI Interface."""

from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class CheckoutSessionRequest(BaseModel):
    user_id: str
    email: str
    amount_cents: int
    currency: str = "USD"
    product_name: str
    product_type: str  # program, membership
    product_id: str
    success_url: str
    cancel_url: str
    metadata: dict[str, Any] = {}


class CheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str
    provider: str


class WebhookVerificationResult(BaseModel):
    is_valid: bool
    event_id: str
    event_type: str
    payload: dict[str, Any]
    error_message: str | None = None


class PaymentGateway(ABC):
    @abstractmethod
    async def create_checkout_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        """Create a hosted checkout session."""
        pass

    @abstractmethod
    async def verify_webhook(self, raw_body: bytes, headers: dict[str, str]) -> WebhookVerificationResult:
        """Verify webhook authenticity and signature."""
        pass

    @abstractmethod
    async def refund_payment(self, payment_id: str, amount_cents: int | None = None) -> bool:
        """Issue full or partial refund."""
        pass
