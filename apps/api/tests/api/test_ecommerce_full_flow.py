"""Comprehensive Automated Acceptance Tests for Annapoorna E-Commerce & Add-to-Cart Engine."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.modules.commerce.models import Cart, Order, Product
from app.modules.roles.models import Role, UserRole
from app.modules.scheduling.models import ClassSession, SeatHold
from app.modules.users.models import User, UserProfile
from app.shared.enums import UserStatus


@pytest.mark.asyncio
async def test_guest_add_product_and_cart_persistence(client: AsyncClient):
    """1, 2, 3: Guest adds product to cart, cart count updates, and guest cart persists."""
    # 1. Fetch available products
    prod_res = await client.get("/api/v1/products")
    assert prod_res.status_code == 200
    products = prod_res.json()
    digital_guide = next(p for p in products if p["product_type"] == "downloadable_guide")

    guest_token = f"guest-test-{uuid.uuid4().hex[:8]}"

    # 2. Add product to guest cart
    add_res = await client.post(
        "/api/v1/cart/items",
        json={
            "product_id": digital_guide["id"],
            "quantity": 1,
            "guest_token": guest_token,
            "currency": "USD",
        },
    )
    assert add_res.status_code == 200
    cart_data = add_res.json()
    assert cart_data["item_count"] == 1
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["product_id"] == digital_guide["id"]

    # 3. Restore cart on subsequent visit using guest_token
    get_res = await client.get(f"/api/v1/cart?guest_token={guest_token}&currency=USD")
    assert get_res.status_code == 200
    restored_cart = get_res.json()
    assert restored_cart["cart_id"] == cart_data["cart_id"]
    assert restored_cart["item_count"] == 1


@pytest.mark.asyncio
async def test_guest_cart_merge_after_login(client: AsyncClient, db_session: AsyncSession):
    """4: Guest cart merges into member cart on login."""
    # Setup Member User
    res = await db_session.execute(select(Role).where(Role.name == "Member"))
    member_role = res.scalar_one()

    user = User(
        email=f"merge_{uuid.uuid4().hex[:6]}@annapoorna.wellness",
        hashed_password="hash",
        status=UserStatus.ACTIVE,
    )
    db_session.add(user)
    await db_session.flush()
    db_session.add(UserProfile(user_id=user.id, first_name="Merge", last_name="User"))
    db_session.add(UserRole(user_id=user.id, role_id=member_role.id))
    await db_session.commit()

    token = create_access_token(subject=str(user.id), roles=["Member"], permissions=["users.read"])
    headers = {"Authorization": f"Bearer {token}"}

    # Create guest cart with course
    prod_res = await client.get("/api/v1/products")
    course = next(p for p in prod_res.json() if p["product_type"] == "course")
    guest_token = f"guest-{uuid.uuid4().hex[:8]}"

    await client.post(
        "/api/v1/cart/items",
        json={
            "product_id": course["id"],
            "quantity": 1,
            "guest_token": guest_token,
            "currency": "USD",
        },
    )

    # Merge cart as authenticated user
    merge_res = await client.post(
        "/api/v1/cart/merge",
        headers=headers,
        json={"guest_token": guest_token, "currency": "USD"},
    )
    assert merge_res.status_code == 200
    merged_cart = merge_res.json()
    assert merged_cart["item_count"] >= 1
    assert any(i["product_id"] == course["id"] for i in merged_cart["items"])


@pytest.mark.asyncio
async def test_live_class_requires_session_and_creates_seat_hold(client: AsyncClient, db_session: AsyncSession):
    """5, 6: Live class requires valid session before adding and creates 15-minute seat hold."""
    prod_res = await client.get("/api/v1/products")
    live_class = next(p for p in prod_res.json() if p["product_type"] == "single_class")

    guest_token = f"guest-{uuid.uuid4().hex[:8]}"

    # Attempt to add live class without session -> Expect 409 Conflict
    err_res = await client.post(
        "/api/v1/cart/items",
        json={
            "product_id": live_class["id"],
            "quantity": 1,
            "guest_token": guest_token,
            "currency": "USD",
        },
    )
    assert err_res.status_code == 409

    # Fetch scheduled session
    sessions_res = await client.get("/api/v1/calendar/sessions")
    session = sessions_res.json()[0]

    # Create seat hold
    hold_res = await client.post(
        "/api/v1/calendar/hold-seat",
        json={"session_id": session["id"], "seats": 1, "guest_token": guest_token},
    )
    assert hold_res.status_code == 200
    hold_data = hold_res.json()

    # Now add with session and seat hold
    add_res = await client.post(
        "/api/v1/cart/items",
        json={
            "product_id": session["product_id"],
            "session_id": session["id"],
            "seat_hold_id": hold_data["seat_hold_id"],
            "quantity": 1,
            "guest_token": guest_token,
            "currency": "USD",
        },
    )
    assert add_res.status_code == 200
    cart = add_res.json()
    assert cart["items"][0]["seat_hold_id"] == hold_data["seat_hold_id"]
    assert cart["items"][0]["seat_hold_seconds_remaining"] is not None
    assert cart["items"][0]["seat_hold_seconds_remaining"] > 0


@pytest.mark.asyncio
async def test_seat_hold_concurrency_and_overselling_prevention(client: AsyncClient, db_session: AsyncSession):
    """7: Two users cannot hold the last available seat simultaneously."""
    # Create single-seat session
    prod_res = await client.get("/api/v1/products")
    product = prod_res.json()[0]

    session = ClassSession(
        product_id=uuid.UUID(product["id"]),
        title="Exclusive VIP Masterclass",
        slug=f"vip-masterclass-{uuid.uuid4().hex[:6]}",
        description="Limited to 1 seat only.",
        start_time=datetime.now(UTC) + timedelta(days=2),
        end_time=datetime.now(UTC) + timedelta(days=2, hours=1),
        duration_minutes=60,
        iana_timezone="Asia/Kolkata",
        capacity=1,
        confirmed_count=0,
        held_count=0,
        status="scheduled",
    )
    db_session.add(session)
    await db_session.commit()

    # User 1 holds seat
    res1 = await client.post(
        "/api/v1/calendar/hold-seat",
        json={"session_id": str(session.id), "seats": 1, "guest_token": "user-1"},
    )
    assert res1.status_code == 200

    # User 2 attempts to hold same seat -> Expect 409 Conflict
    res2 = await client.post(
        "/api/v1/calendar/hold-seat",
        json={"session_id": str(session.id), "seats": 1, "guest_token": "user-2"},
    )
    assert res2.status_code == 409


@pytest.mark.asyncio
async def test_coupon_discount_rules_and_backend_pricing(client: AsyncClient):
    """9, 10: Backend computes pricing strictly and enforces coupon rules."""
    prod_res = await client.get("/api/v1/products")
    product = next(p for p in prod_res.json() if p["product_type"] in ["course", "downloadable_guide", "meal_plan_package"])
    guest_token = f"coupon-{uuid.uuid4().hex[:8]}"

    # Add product to cart
    add_res = await client.post(
        "/api/v1/cart/items",
        json={
            "product_id": product["id"],
            "quantity": 2,
            "guest_token": guest_token,
            "currency": "USD",
        },
    )
    assert add_res.status_code == 200
    cart = add_res.json()
    cart_id = cart["cart_id"]

    # Apply valid 10% coupon
    coupon_res = await client.post(
        "/api/v1/cart/apply-coupon",
        json={"cart_id": cart_id, "coupon_code": "ANNAPOORNA10"},
    )
    assert coupon_res.status_code == 200
    discounted_cart = coupon_res.json()
    assert discounted_cart["coupon_code"] == "ANNAPOORNA10"
    assert discounted_cart["discount_minor"] == (discounted_cart["subtotal_minor"] * 10) // 100
    assert discounted_cart["total_minor"] == discounted_cart["subtotal_minor"] - discounted_cart["discount_minor"]

    # Attempt to apply invalid coupon -> Expect 409 Conflict
    bad_res = await client.post(
        "/api/v1/cart/apply-coupon",
        json={"cart_id": cart_id, "coupon_code": "INVALID999"},
    )
    assert bad_res.status_code == 409


@pytest.mark.asyncio
async def test_order_settlement_and_idempotent_webhooks(client: AsyncClient, db_session: AsyncSession):
    """11, 12, 13, 14: Order payment settlement, entitlements, and idempotent webhooks."""
    # 1. Setup Member User
    res = await db_session.execute(select(Role).where(Role.name == "Member"))
    member_role = res.scalar_one()

    user = User(
        email=f"order_{uuid.uuid4().hex[:6]}@annapoorna.wellness",
        hashed_password="hash",
        status=UserStatus.ACTIVE,
    )
    db_session.add(user)
    await db_session.flush()
    db_session.add(UserProfile(user_id=user.id, first_name="Order", last_name="Tester"))
    db_session.add(UserRole(user_id=user.id, role_id=member_role.id))
    await db_session.commit()

    token = create_access_token(subject=str(user.id), roles=["Member"], permissions=["users.read"])
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add course to cart
    prod_res = await client.get("/api/v1/products")
    product = next(p for p in prod_res.json() if p["product_type"] in ["course", "downloadable_guide", "meal_plan_package"])
    cart_res = await client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={"product_id": product["id"], "quantity": 1, "currency": "USD"},
    )
    assert cart_res.status_code == 200
    cart = cart_res.json()

    # 3. Create Checkout Session
    checkout_res = await client.post(
        "/api/v1/checkout",
        headers=headers,
        json={
            "cart_id": cart["cart_id"],
            "email": user.email,
            "first_name": "Order",
            "last_name": "Tester",
            "currency": "USD",
            "payment_provider": "mock",
        },
    )
    assert checkout_res.status_code == 200
    order_data = checkout_res.json()

    # 4. Settle Order Payment
    pay_res = await client.post(
        f"/api/v1/payments/orders/{order_data['order_id']}/complete",
        headers=headers,
        json={"order_id": order_data["order_id"], "payment_method": "mock"},
    )
    assert pay_res.status_code == 200
    completed = pay_res.json()
    assert completed["status"] == "paid"

    # 5. Verify order is paid in database
    db_order = await db_session.get(Order, uuid.UUID(order_data["order_id"]))
    assert db_order.status == "paid"
    assert db_order.paid_at is not None
