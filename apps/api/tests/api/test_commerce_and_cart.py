"""Tests for Multi-Currency Products, Server Cart, Coupons, and Checkout Sessions."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_products_and_multi_currency_pricing(client: AsyncClient):
    response = await client.get("/api/v1/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 8

    # Find the foundations class
    foundations = next((p for p in products if p["slug"] == "plant-based-foundations-class"), None)
    assert foundations is not None
    assert len(foundations["prices"]) == 2
    usd_price = next((pr for pr in foundations["prices"] if pr["currency"] == "USD"), None)
    inr_price = next((pr for pr in foundations["prices"] if pr["currency"] == "INR"), None)
    assert usd_price["amount_minor"] == 2500
    assert inr_price["amount_minor"] == 199900


@pytest.mark.asyncio
async def test_cart_operations_and_coupons(client: AsyncClient):
    # 1. Fetch products to get a valid digital product
    prod_res = await client.get("/api/v1/products")
    product = next(p for p in prod_res.json() if p["product_type"] in ["course", "downloadable_guide", "meal_plan_package"])
    product_id = product["id"]

    # 2. Add product to cart
    add_res = await client.post(
        "/api/v1/cart/items",
        json={
            "product_id": product_id,
            "quantity": 1,
            "currency": "USD",
            "guest_token": "test-guest-token-123",
        },
    )
    assert add_res.status_code == 200
    cart = add_res.json()
    assert cart["item_count"] == 1
    assert cart["subtotal_minor"] > 0
    cart_id = cart["cart_id"]

    # 3. Apply discount coupon ANNAPOORNA10
    coupon_res = await client.post(
        "/api/v1/cart/coupon",
        json={
            "cart_id": cart_id,
            "coupon_code": "ANNAPOORNA10",
        },
    )
    assert coupon_res.status_code == 200
    discounted_cart = coupon_res.json()
    assert discounted_cart["coupon_code"] == "ANNAPOORNA10"
    assert discounted_cart["discount_minor"] > 0
    assert discounted_cart["total_minor"] == discounted_cart["subtotal_minor"] - discounted_cart["discount_minor"]
