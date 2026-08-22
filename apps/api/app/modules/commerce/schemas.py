"""Commerce, Products, Multi-Currency Pricing, and Cart Pydantic Schemas."""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ProductPriceSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    currency: str  # USD, INR
    amount_minor: int
    compare_at_minor: int | None = None


class ProductDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    product_type: str
    short_description: str
    full_description: str | None = None
    image_url: str | None = None
    instructor_name: str | None = None
    instructor_title: str | None = None
    rating: float | None = None
    review_count: int = 0
    pillar_tag: str | None = "Nutrition"
    is_active: bool
    is_featured: bool
    capacity: int | None = None
    access_duration_days: int | None = None
    refund_policy_days: int = 7
    learning_outcomes: list[str] = []
    what_is_included: list[str] = []
    requirements: list[str] = []
    suitable_audience: str | None = None
    prices: list[ProductPriceSchema] = []


class AddToCartRequest(BaseModel):
    product_id: uuid.UUID
    session_id: uuid.UUID | None = None
    seat_hold_id: uuid.UUID | None = None
    slot_hold_id: uuid.UUID | None = None
    quantity: int = Field(default=1, ge=1, le=10)
    guest_token: str | None = None
    currency: str = "USD"
    variation_meta: dict | None = None


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., ge=1, le=10)


class MergeCartRequest(BaseModel):
    guest_token: str
    currency: str = "USD"


class CartItemSchema(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    product_type: str
    session_id: uuid.UUID | None = None
    seat_hold_id: uuid.UUID | None = None
    slot_hold_id: uuid.UUID | None = None
    quantity: int
    unit_price_minor: int
    total_minor: int
    variation_meta: dict | None = None
    seat_hold_expires_at: datetime | None = None
    seat_hold_seconds_remaining: int | None = None


class SavedItemSchema(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    product_type: str
    unit_price_minor: int
    currency: str
    variation_meta: dict | None = None


class CartResponse(BaseModel):
    cart_id: uuid.UUID
    currency: str
    items: list[CartItemSchema]
    saved_items: list[SavedItemSchema] = []
    subtotal_minor: int
    discount_minor: int
    tax_minor: int
    total_minor: int
    coupon_code: str | None = None
    item_count: int
    has_expired_holds: bool = False


class ApplyCouponRequest(BaseModel):
    cart_id: uuid.UUID
    coupon_code: str


class SaveForLaterRequest(BaseModel):
    cart_item_id: uuid.UUID


class MoveToCartRequest(BaseModel):
    saved_item_id: uuid.UUID
    session_id: uuid.UUID | None = None
    seat_hold_id: uuid.UUID | None = None
    currency: str = "USD"


class CartValidationResponse(BaseModel):
    is_valid: bool
    currency: str
    total_minor: int
    errors: list[str] = []
    warnings: list[str] = []


class CreateCheckoutSessionRequest(BaseModel):
    cart_id: uuid.UUID
    email: str
    first_name: str
    last_name: str | None = None
    currency: str = "USD"
    payment_provider: str = "mock"  # mock, stripe, razorpay


class CheckoutSessionResponse(BaseModel):
    order_id: uuid.UUID
    order_number: str
    checkout_url: str
    total_minor: int
    currency: str
    payment_provider: str
