"""Commerce and Cart API Router."""

import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import UserContext
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context, get_optional_user_context
from app.modules.commerce.schemas import (
    AddToCartRequest,
    ApplyCouponRequest,
    CartResponse,
    CartValidationResponse,
    CheckoutSessionResponse,
    CreateCheckoutSessionRequest,
    MergeCartRequest,
    MoveToCartRequest,
    ProductDetailSchema,
    SaveForLaterRequest,
    UpdateCartItemRequest,
)
from app.modules.commerce.service import CommerceService

router = APIRouter(tags=["Commerce & Cart"])


@router.get("/products", response_model=list[ProductDetailSchema], summary="List all active wellness products and multi-currency pricing")
async def get_products(
    product_type: str | None = Query(None, description="Filter by product_type"),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    return await service.list_products(product_type=product_type)


@router.get("/products/{slug}", response_model=ProductDetailSchema, summary="Get single product detail by slug")
async def get_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    return await service.get_product_by_slug(slug)


@router.get("/cart", response_model=CartResponse, summary="Get or create shopping cart with real-time seat hold remaining timers")
async def get_cart(
    cart_id: uuid.UUID | None = Query(None),
    guest_token: str | None = Query(None),
    currency: str = Query("USD"),
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else None
    return await service.get_or_create_cart(
        cart_id=cart_id,
        user_id=user_id,
        guest_token=guest_token,
        currency=currency,
    )


@router.post("/cart/items", response_model=CartResponse, summary="Add product or scheduled class session to cart")
async def add_item_to_cart(
    req: AddToCartRequest,
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else None
    return await service.add_to_cart(req=req, user_id=user_id)


@router.patch("/cart/items/{item_id}", response_model=CartResponse, summary="Update quantity of a cart item")
async def update_cart_item(
    item_id: uuid.UUID,
    req: UpdateCartItemRequest,
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else None
    return await service.update_cart_item_quantity(item_id=item_id, quantity=req.quantity, user_id=user_id)


@router.delete("/cart/items/{item_id}", response_model=CartResponse, summary="Remove item from cart and release held seat")
async def remove_cart_item(
    item_id: uuid.UUID,
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else None
    return await service.remove_cart_item(item_id=item_id, user_id=user_id)


@router.post("/cart/merge", response_model=CartResponse, summary="Merge guest cart into authenticated user cart after login")
async def merge_cart(
    req: MergeCartRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    return await service.merge_guest_cart(
        guest_token=req.guest_token,
        user_id=uuid.UUID(user_context.user_id),
        currency=req.currency,
    )


@router.post("/cart/apply-coupon", response_model=CartResponse, summary="Apply discount coupon to cart")
@router.post("/cart/coupon", response_model=CartResponse, summary="Apply discount coupon to cart (alias)")
async def apply_coupon(
    req: ApplyCouponRequest,
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else None
    return await service.apply_coupon(cart_id=req.cart_id, coupon_code=req.coupon_code, user_id=user_id)


@router.delete("/cart/coupon", response_model=CartResponse, summary="Remove discount coupon from cart")
async def remove_coupon(
    cart_id: uuid.UUID = Query(...),
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else None
    return await service.remove_coupon(cart_id=cart_id, user_id=user_id)


@router.post("/cart/save-for-later", response_model=CartResponse, summary="Move item from active cart to member saved list")
async def save_for_later(
    req: SaveForLaterRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    return await service.save_for_later(cart_item_id=req.cart_item_id, user_id=uuid.UUID(user_context.user_id))


@router.post("/cart/move-to-cart", response_model=CartResponse, summary="Move saved item back to active cart")
async def move_to_cart(
    req: MoveToCartRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    return await service.move_to_cart(
        saved_item_id=req.saved_item_id,
        user_id=uuid.UUID(user_context.user_id),
        session_id=req.session_id,
        seat_hold_id=req.seat_hold_id,
        currency=req.currency,
    )


@router.post("/cart/validate", response_model=CartValidationResponse, summary="Pre-checkout validation for active seat holds and price verification")
async def validate_cart(
    cart_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    return await service.validate_cart(cart_id=cart_id)


@router.post("/checkout/session", response_model=CheckoutSessionResponse, summary="Create checkout session from cart")
@router.post("/checkout", response_model=CheckoutSessionResponse, summary="Create checkout session from cart (alias)")
async def create_checkout_session(
    req: CreateCheckoutSessionRequest,
    user_context: UserContext | None = Depends(get_optional_user_context),
    db: AsyncSession = Depends(get_db),
):
    service = CommerceService(db)
    user_id = uuid.UUID(user_context.user_id) if user_context else uuid.uuid4()
    return await service.create_checkout_session(req=req, user_id=user_id)
