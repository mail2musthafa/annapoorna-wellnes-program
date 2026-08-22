"""Commerce, Products, Server-Backed Cart, and Checkout Business Logic Service."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.commerce.models import (
    AbandonedCartEvent,
    Cart,
    CartItem,
    CheckoutAttempt,
    CouponRedemption,
    Order,
    OrderItem,
    Product,
    SavedItem,
)
from app.modules.commerce.schemas import (
    AddToCartRequest,
    CartItemSchema,
    CartResponse,
    CartValidationResponse,
    CheckoutSessionResponse,
    CreateCheckoutSessionRequest,
    ProductDetailSchema,
    ProductPriceSchema,
    SavedItemSchema,
)
from app.modules.payments.models import Coupon
from app.modules.scheduling.models import SeatHold


class CommerceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_products(self, product_type: str | None = None) -> list[ProductDetailSchema]:
        query = select(Product).where(Product.is_active.is_(True), Product.is_deleted.is_(False))
        if product_type:
            query = query.where(Product.product_type == product_type)

        result = await self.db.execute(query)
        products = result.scalars().all()

        return [self._map_product_detail(p) for p in products]

    async def get_product_by_slug(self, slug: str) -> ProductDetailSchema:
        query = select(Product).where(
            Product.slug == slug, Product.is_active.is_(True), Product.is_deleted.is_(False)
        )
        res = await self.db.execute(query)
        product = res.scalar_one_or_none()
        if not product:
            raise NotFoundException(f"Product with slug '{slug}' not found.")
        return self._map_product_detail(product)

    async def get_or_create_cart(
        self,
        cart_id: uuid.UUID | None = None,
        user_id: uuid.UUID | None = None,
        guest_token: str | None = None,
        currency: str = "USD",
    ) -> CartResponse:
        cart = None
        if cart_id:
            res = await self.db.execute(select(Cart).where(Cart.id == cart_id))
            cart = res.scalar_one_or_none()
        elif user_id:
            res = await self.db.execute(select(Cart).where(Cart.user_id == user_id, Cart.status == "active"))
            cart = res.scalar_one_or_none()
        elif guest_token:
            res = await self.db.execute(select(Cart).where(Cart.guest_token == guest_token, Cart.status == "active"))
            cart = res.scalar_one_or_none()

        if not cart:
            cart = Cart(
                user_id=user_id,
                guest_token=guest_token or str(uuid.uuid4()),
                currency=currency,
                status="active",
            )
            self.db.add(cart)
            await self.db.commit()
            await self.db.refresh(cart)

        return await self._build_cart_response(cart, user_id=user_id)

    async def add_to_cart(
        self,
        req: AddToCartRequest,
        user_id: uuid.UUID | None = None,
    ) -> CartResponse:
        cart_res = await self.get_or_create_cart(
            user_id=user_id,
            guest_token=req.guest_token,
            currency=req.currency,
        )
        cart = await self.db.get(Cart, cart_res.cart_id)
        if not cart:
            raise NotFoundException("Cart not found.")

        # 1. Fetch product
        prod_res = await self.db.execute(
            select(Product).where(Product.id == req.product_id, Product.is_active.is_(True))
        )
        product = prod_res.scalar_one_or_none()
        if not product:
            raise NotFoundException("Product not found or unavailable.")

        # 2. Check Live class session requirement
        if product.product_type in ["single_class", "workshop"] and not req.session_id:
            raise ConflictException("Live classes require selecting a scheduled date and time session before adding to cart.")

        # 3. Determine authoritative price strictly on server
        price_minor = 0
        for p in product.prices:
            if p.currency == req.currency and p.is_active:
                price_minor = p.amount_minor
                break

        if price_minor == 0:
            price_minor = 2500 if req.currency == "USD" else 199900

        # 4. Validate Seat Hold if session_id is provided
        if req.session_id and req.seat_hold_id:
            hold_res = await self.db.execute(
                select(SeatHold).where(
                    SeatHold.id == req.seat_hold_id,
                    SeatHold.session_id == req.session_id,
                    SeatHold.is_released.is_(False),
                )
            )
            hold = hold_res.scalar_one_or_none()
            if not hold:
                raise ConflictException("Seat hold has expired. Please select a session and re-hold your seat.")
            exp = hold.expires_at.replace(tzinfo=UTC) if hold.expires_at.tzinfo is None else hold.expires_at
            if exp < datetime.now(UTC):
                raise ConflictException("Seat hold has expired. Please select a session and re-hold your seat.")

        # 5. Check if item already exists in cart -> update quantity (classes remain 1)
        existing_item = None
        for item in cart.items:
            if item.product_id == req.product_id:
                if req.session_id and item.session_id == req.session_id:
                    existing_item = item
                    break
                elif not req.session_id:
                    existing_item = item
                    break

        if existing_item:
            if product.product_type in ["single_class", "workshop", "consultation"]:
                existing_item.quantity = 1
            else:
                existing_item.quantity = min(10, existing_item.quantity + req.quantity)
            if req.seat_hold_id:
                existing_item.seat_hold_id = req.seat_hold_id
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product.id,
                session_id=req.session_id,
                seat_hold_id=req.seat_hold_id,
                slot_hold_id=req.slot_hold_id,
                quantity=1 if product.product_type in ["single_class", "workshop", "consultation"] else req.quantity,
                unit_price_minor=price_minor,
                variation_meta=req.variation_meta or {},
            )
            self.db.add(cart_item)

        await self.db.commit()
        await self.db.refresh(cart)

        return await self._build_cart_response(cart, user_id=user_id)

    async def update_cart_item_quantity(
        self,
        item_id: uuid.UUID,
        quantity: int,
        user_id: uuid.UUID | None = None,
    ) -> CartResponse:
        item = await self.db.get(CartItem, item_id)
        if not item:
            raise NotFoundException("Cart item not found.")

        item.quantity = max(1, min(10, quantity))
        await self.db.commit()

        cart = await self.db.get(Cart, item.cart_id)
        return await self._build_cart_response(cart, user_id=user_id)

    async def remove_cart_item(
        self,
        item_id: uuid.UUID,
        user_id: uuid.UUID | None = None,
    ) -> CartResponse:
        item = await self.db.get(CartItem, item_id)
        if not item:
            raise NotFoundException("Cart item not found.")

        cart_id = item.cart_id

        # Release seat hold if active
        if item.seat_hold_id:
            hold = await self.db.get(SeatHold, item.seat_hold_id)
            if hold:
                hold.is_released = True

        await self.db.delete(item)
        await self.db.commit()

        cart = await self.db.get(Cart, cart_id)
        return await self._build_cart_response(cart, user_id=user_id)

    async def merge_guest_cart(
        self,
        guest_token: str,
        user_id: uuid.UUID,
        currency: str = "USD",
    ) -> CartResponse:
        # Find guest cart
        g_res = await self.db.execute(select(Cart).where(Cart.guest_token == guest_token, Cart.status == "active"))
        guest_cart = g_res.scalar_one_or_none()

        # Find or create user cart
        u_res = await self.db.execute(select(Cart).where(Cart.user_id == user_id, Cart.status == "active"))
        user_cart = u_res.scalar_one_or_none()

        if not user_cart:
            if guest_cart:
                guest_cart.user_id = user_id
                guest_cart.guest_token = None
                await self.db.commit()
                await self.db.refresh(guest_cart)
                return await self._build_cart_response(guest_cart, user_id=user_id)
            else:
                user_cart = Cart(user_id=user_id, currency=currency, status="active")
                self.db.add(user_cart)
                await self.db.commit()
                await self.db.refresh(user_cart)
                return await self._build_cart_response(user_cart, user_id=user_id)

        # Merge items from guest cart into user cart
        if guest_cart and guest_cart.items:
            for g_item in guest_cart.items:
                # Check for duplicate
                existing = next(
                    (i for i in user_cart.items if i.product_id == g_item.product_id and i.session_id == g_item.session_id),
                    None,
                )
                if existing:
                    existing.quantity = min(10, existing.quantity + g_item.quantity)
                else:
                    new_item = CartItem(
                        cart_id=user_cart.id,
                        product_id=g_item.product_id,
                        session_id=g_item.session_id,
                        seat_hold_id=g_item.seat_hold_id,
                        slot_hold_id=g_item.slot_hold_id,
                        quantity=g_item.quantity,
                        unit_price_minor=g_item.unit_price_minor,
                        variation_meta=g_item.variation_meta,
                    )
                    self.db.add(new_item)

            await self.db.delete(guest_cart)
            await self.db.commit()
            await self.db.refresh(user_cart)

        return await self._build_cart_response(user_cart, user_id=user_id)

    async def apply_coupon(self, cart_id: uuid.UUID, coupon_code: str, user_id: uuid.UUID | None = None) -> CartResponse:
        cart = await self.db.get(Cart, cart_id)
        if not cart:
            raise NotFoundException("Cart not found.")

        code = coupon_code.strip().upper()

        # Query coupon
        res = await self.db.execute(select(Coupon).where(Coupon.code == code, Coupon.is_active.is_(True)))
        coupon = res.scalar_one_or_none()

        discount_percent = 10
        if coupon:
            if coupon.expires_at and coupon.expires_at < datetime.now(UTC):
                raise ConflictException("Coupon has expired.")
            if coupon.max_redemptions and coupon.current_redemptions >= coupon.max_redemptions:
                raise ConflictException("Coupon usage limit reached.")
            discount_percent = coupon.discount_percent or 10
        elif code in ["ANNAPOORNA10", "WELCOME10"]:
            discount_percent = 10
        elif code in ["VITALITY20", "RESET20"]:
            discount_percent = 20
        else:
            raise ConflictException(f"Coupon code '{coupon_code}' is invalid or expired.")

        subtotal = sum(i.unit_price_minor * i.quantity for i in cart.items)
        cart.coupon_code = code
        cart.discount_minor = (subtotal * discount_percent) // 100
        await self.db.commit()
        await self.db.refresh(cart)

        return await self._build_cart_response(cart, user_id=user_id)

    async def remove_coupon(self, cart_id: uuid.UUID, user_id: uuid.UUID | None = None) -> CartResponse:
        cart = await self.db.get(Cart, cart_id)
        if not cart:
            raise NotFoundException("Cart not found.")

        cart.coupon_code = None
        cart.discount_minor = 0
        await self.db.commit()
        await self.db.refresh(cart)

        return await self._build_cart_response(cart, user_id=user_id)

    async def save_for_later(self, cart_item_id: uuid.UUID, user_id: uuid.UUID) -> CartResponse:
        item = await self.db.get(CartItem, cart_item_id)
        if not item:
            raise NotFoundException("Cart item not found.")

        cart_id = item.cart_id

        # Release seat hold
        if item.seat_hold_id:
            hold = await self.db.get(SeatHold, item.seat_hold_id)
            if hold:
                hold.is_released = True

        saved = SavedItem(
            user_id=user_id,
            product_id=item.product_id,
            variation_meta=item.variation_meta,
        )
        self.db.add(saved)
        await self.db.delete(item)
        await self.db.commit()

        cart = await self.db.get(Cart, cart_id)
        return await self._build_cart_response(cart, user_id=user_id)

    async def move_to_cart(
        self,
        saved_item_id: uuid.UUID,
        user_id: uuid.UUID,
        session_id: uuid.UUID | None = None,
        seat_hold_id: uuid.UUID | None = None,
        currency: str = "USD",
    ) -> CartResponse:
        saved = await self.db.get(SavedItem, saved_item_id)
        if not saved or saved.user_id != user_id:
            raise NotFoundException("Saved item not found.")

        add_req = AddToCartRequest(
            product_id=saved.product_id,
            session_id=session_id,
            seat_hold_id=seat_hold_id,
            quantity=1,
            currency=currency,
            variation_meta=saved.variation_meta,
        )

        res = await self.add_to_cart(add_req, user_id=user_id)
        await self.db.delete(saved)
        await self.db.commit()

        cart = await self.db.get(Cart, res.cart_id)
        return await self._build_cart_response(cart, user_id=user_id)

    async def validate_cart(self, cart_id: uuid.UUID) -> CartValidationResponse:
        cart = await self.db.get(Cart, cart_id)
        if not cart or not cart.items:
            return CartValidationResponse(
                is_valid=False,
                currency=cart.currency if cart else "USD",
                total_minor=0,
                errors=["Cart is empty."],
            )

        errors: list[str] = []
        warnings: list[str] = []
        now = datetime.now(UTC)

        for item in cart.items:
            if item.seat_hold_id:
                hold = await self.db.get(SeatHold, item.seat_hold_id)
                if not hold or hold.is_released:
                    errors.append(f"Seat hold for '{item.product.name if item.product else 'Class'}' has expired. Please select a new session.")
                else:
                    exp = hold.expires_at.replace(tzinfo=UTC) if hold.expires_at.tzinfo is None else hold.expires_at
                    if exp < now:
                        errors.append(f"Seat hold for '{item.product.name if item.product else 'Class'}' has expired. Please select a new session.")

        subtotal = sum(i.unit_price_minor * i.quantity for i in cart.items)
        total = max(0, subtotal - cart.discount_minor)

        return CartValidationResponse(
            is_valid=len(errors) == 0,
            currency=cart.currency,
            total_minor=total,
            errors=errors,
            warnings=warnings,
        )

    async def create_checkout_session(
        self,
        req: CreateCheckoutSessionRequest,
        user_id: uuid.UUID,
    ) -> CheckoutSessionResponse:
        cart = await self.db.get(Cart, req.cart_id)
        if not cart or not cart.items:
            raise ConflictException("Cart is empty or does not exist.")

        # Validate holds before creating order
        val = await self.validate_cart(cart.id)
        if not val.is_valid:
            # Record checkout attempt failure
            attempt = CheckoutAttempt(
                cart_id=cart.id,
                user_id=user_id,
                email=req.email,
                status="failed",
                error_reason=", ".join(val.errors),
            )
            self.db.add(attempt)
            await self.db.commit()
            raise ConflictException("; ".join(val.errors))

        subtotal = sum(i.unit_price_minor * i.quantity for i in cart.items)
        discount = cart.discount_minor
        tax = 0
        total = max(0, subtotal - discount + tax)

        order_number = f"ANP-{datetime.now(UTC).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        order = Order(
            order_number=order_number,
            user_id=user_id,
            email=req.email,
            currency=req.currency,
            subtotal_minor=subtotal,
            discount_minor=discount,
            tax_minor=tax,
            total_minor=total,
            status="pending",
            payment_provider=req.payment_provider,
        )
        self.db.add(order)
        await self.db.flush()

        for item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else "Annapoorna Wellness Product",
                product_type=item.product.product_type if item.product else "single_class",
                session_id=item.session_id,
                quantity=item.quantity,
                unit_price_minor=item.unit_price_minor,
                total_minor=item.unit_price_minor * item.quantity,
                variation_meta=item.variation_meta,
            )
            self.db.add(order_item)

        # Record redemption if coupon was applied
        if cart.coupon_code:
            redemption = CouponRedemption(
                coupon_code=cart.coupon_code,
                user_id=user_id,
                order_id=order.id,
                discount_minor=discount,
            )
            self.db.add(redemption)

        # Record checkout attempt initiated
        attempt = CheckoutAttempt(
            cart_id=cart.id,
            user_id=user_id,
            email=req.email,
            status="initiated",
        )
        self.db.add(attempt)

        await self.db.commit()
        await self.db.refresh(order)

        checkout_url = f"/checkout/pay?order_id={order.id}&amount={total}&currency={req.currency}"

        return CheckoutSessionResponse(
            order_id=order.id,
            order_number=order.order_number,
            checkout_url=checkout_url,
            total_minor=total,
            currency=req.currency,
            payment_provider=req.payment_provider,
        )

    async def _build_cart_response(self, cart: Cart, user_id: uuid.UUID | None = None) -> CartResponse:
        items: list[CartItemSchema] = []
        subtotal = 0
        now = datetime.now(UTC)
        has_expired_holds = False

        for i in cart.items:
            item_total = i.unit_price_minor * i.quantity
            subtotal += item_total
            expires_at = None
            secs_remaining = None

            if i.seat_hold_id:
                hold = await self.db.get(SeatHold, i.seat_hold_id)
                if hold:
                    exp = hold.expires_at.replace(tzinfo=UTC) if hold.expires_at.tzinfo is None else hold.expires_at
                    expires_at = exp
                    rem = int((exp - now).total_seconds())
                    secs_remaining = max(0, rem)
                    if rem <= 0:
                        has_expired_holds = True

            items.append(
                CartItemSchema(
                    id=i.id,
                    product_id=i.product_id,
                    product_name=i.product.name if i.product else "Wellness Product",
                    product_type=i.product.product_type if i.product else "single_class",
                    session_id=i.session_id,
                    seat_hold_id=i.seat_hold_id,
                    slot_hold_id=i.slot_hold_id,
                    quantity=i.quantity,
                    unit_price_minor=i.unit_price_minor,
                    total_minor=item_total,
                    variation_meta=i.variation_meta,
                    seat_hold_expires_at=expires_at,
                    seat_hold_seconds_remaining=secs_remaining,
                )
            )

        # Fetch saved items for user if authenticated
        saved_items: list[SavedItemSchema] = []
        if user_id:
            saved_res = await self.db.execute(select(SavedItem).where(SavedItem.user_id == user_id))
            for s in saved_res.scalars().all():
                price = 2500 if cart.currency == "USD" else 199900
                if s.product and s.product.prices:
                    for pr in s.product.prices:
                        if pr.currency == cart.currency:
                            price = pr.amount_minor
                            break
                saved_items.append(
                    SavedItemSchema(
                        id=s.id,
                        product_id=s.product_id,
                        product_name=s.product.name if s.product else "Saved Item",
                        product_type=s.product.product_type if s.product else "single_class",
                        unit_price_minor=price,
                        currency=cart.currency,
                        variation_meta=s.variation_meta,
                    )
                )

        total = max(0, subtotal - cart.discount_minor)

        return CartResponse(
            cart_id=cart.id,
            currency=cart.currency,
            items=items,
            saved_items=saved_items,
            subtotal_minor=subtotal,
            discount_minor=cart.discount_minor,
            tax_minor=0,
            total_minor=total,
            coupon_code=cart.coupon_code,
            item_count=sum(i.quantity for i in cart.items),
            has_expired_holds=has_expired_holds,
        )

    def _map_product_detail(self, p: Product) -> ProductDetailSchema:
        prices = [
            ProductPriceSchema(
                currency=pr.currency,
                amount_minor=pr.amount_minor,
                compare_at_minor=pr.compare_at_minor,
            )
            for pr in p.prices
            if pr.is_active
        ]
        return ProductDetailSchema(
            id=p.id,
            name=p.name,
            slug=p.slug,
            product_type=p.product_type,
            short_description=p.short_description,
            full_description=p.full_description,
            image_url=p.image_url,
            instructor_name=p.instructor_name,
            instructor_title=p.instructor_title,
            rating=p.rating,
            review_count=p.review_count,
            pillar_tag=p.pillar_tag,
            is_active=p.is_active,
            is_featured=p.is_featured,
            capacity=p.capacity,
            access_duration_days=p.access_duration_days,
            refund_policy_days=p.refund_policy_days,
            learning_outcomes=p.learning_outcomes or [],
            what_is_included=p.what_is_included or [],
            requirements=p.requirements or [],
            suitable_audience=p.suitable_audience,
            prices=prices,
        )
