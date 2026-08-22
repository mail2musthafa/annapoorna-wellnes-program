"""Commerce, Products, Prices, Cart, Orders, and Invoices Database Models."""

import uuid
from datetime import datetime

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
from app.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Product(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    """
    Common product model for classes, workshops, programs, memberships, consultations, courses.
    """
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    product_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # single_class, workshop, program, membership_monthly, membership_annual, consultation, coaching_package, course, meal_plan_package, recipe_bundle, downloadable_guide
    short_description: Mapped[str] = mapped_column(Text, nullable=False)
    full_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    instructor_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    instructor_title: Mapped[str | None] = mapped_column(String(150), nullable=True)
    rating: Mapped[float | None] = mapped_column(default=None, nullable=True)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pillar_tag: Mapped[str | None] = mapped_column(String(100), default="Nutrition", nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    access_duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    refund_policy_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    learning_outcomes: Mapped[list | None] = mapped_column(JSON, default=list, nullable=True)
    what_is_included: Mapped[list | None] = mapped_column(JSON, default=list, nullable=True)
    requirements: Mapped[list | None] = mapped_column(JSON, default=list, nullable=True)
    suitable_audience: Mapped[str | None] = mapped_column(Text, nullable=True)

    prices: Mapped[list["ProductPrice"]] = relationship(
        "ProductPrice",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    entitlement_rules: Mapped[list["ProductEntitlementRule"]] = relationship(
        "ProductEntitlementRule",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ProductPrice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Multi-currency price definitions stored in integer minor units (cents/paise).
    """
    __tablename__ = "product_prices"
    __table_args__ = (
        UniqueConstraint("product_id", "currency", name="uq_product_currency_price"),
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False)  # USD, INR
    amount_minor: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g., 2500 ($25.00) or 199900 (₹1999)
    compare_at_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="prices")


class ProductEntitlementRule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "product_entitlement_rules"

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)  # live_class, course, program, membership, meal_plan, resource, consultation
    resource_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)

    product: Mapped["Product"] = relationship("Product", back_populates="entitlement_rules")


class Cart(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Server-persisted shopping cart.
    """
    __tablename__ = "carts"

    guest_token: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    coupon_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    discount_minor: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)  # active, converted, abandoned

    items: Mapped[list["CartItem"]] = relationship(
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class CartItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "cart_items"

    cart_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("carts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    seat_hold_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    slot_hold_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    variation_meta: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)

    cart: Mapped["Cart"] = relationship("Cart", back_populates="items")
    product: Mapped["Product"] = relationship("Product", lazy="selectin")


class SavedItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Save for later list for authenticated members.
    """
    __tablename__ = "saved_items"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    variation_meta: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)

    product: Mapped["Product"] = relationship("Product", lazy="selectin")


class SlotHold(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    15-minute temporary reservation for 1-on-1 consultations and coaching slots.
    """
    __tablename__ = "slot_holds"

    expert_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), nullable=False, index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    guest_token: Mapped[str | None] = mapped_column(String(100), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    is_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class CouponRedemption(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Audit record tracking coupon usage per user and order.
    """
    __tablename__ = "coupon_redemptions"

    coupon_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True, index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), nullable=False, index=True)
    discount_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    redeemed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class CheckoutAttempt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Tracks checkout initiation and failures.
    """
    __tablename__ = "checkout_attempts"

    cart_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="initiated", nullable=False)  # initiated, failed, completed
    error_reason: Mapped[str | None] = mapped_column(Text, nullable=True)


class AbandonedCartEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Tracks abandoned carts for permitted operational and administrative visibility.
    """
    __tablename__ = "abandoned_cart_events"

    cart_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cart_value_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    items_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    has_marketing_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_activity_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Order(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "orders"

    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    subtotal_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    discount_minor: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tax_minor: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False, index=True)  # pending, paid, cancelled, refunded
    payment_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)  # stripe, razorpay, mock
    provider_session_id: Mapped[str | None] = mapped_column(String(150), nullable=True)
    provider_payment_id: Mapped[str | None] = mapped_column(String(150), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    invoices: Mapped[list["Invoice"]] = relationship(
        "Invoice",
        back_populates="order",
        cascade="all, delete-orphan",
    )


class OrderItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "order_items"

    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
    )
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_type: Mapped[str] = mapped_column(String(50), nullable=False)
    session_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    total_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    variation_meta: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="items")


class Invoice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "invoices"

    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="paid", nullable=False)
    download_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="invoices")
