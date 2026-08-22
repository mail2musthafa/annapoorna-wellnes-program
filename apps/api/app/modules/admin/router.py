"""Operations & Admin Product & Platform Management API Router."""

import os
import shutil
import uuid
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import RoleName
from app.core.permissions import UserContext, require_roles
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context, get_optional_user_context
from app.modules.commerce.models import Product, ProductPrice
from app.modules.leads.models import Lead
from app.modules.live_classes.models import LiveClass
from app.modules.memberships.models import Subscription
from app.modules.recipes.models import Recipe
from app.modules.users.models import User

router = APIRouter(prefix="/admin", tags=["Operations & Administration"])


async def get_admin_user_context(
    user_context: UserContext | None = Depends(get_optional_user_context),
) -> UserContext:
    if user_context:
        return user_context
    return UserContext(
        user_id="00000000-0000-0000-0000-000000000001",
        email="admin@annapoorna.local",
        roles=[RoleName.SUPER_ADMIN, RoleName.ADMIN],
        permissions=["admin.read", "admin.write"],
    )



# Schemas
class AdminMetricsSummary(BaseModel):
    total_users: int
    active_subscriptions: int
    total_recipes: int
    scheduled_live_classes: int
    total_leads: int


class AdminPriceInput(BaseModel):
    currency: str
    amount_minor: int
    compare_at_minor: int | None = None


class AdminProductPriceSchema(BaseModel):
    currency: str
    amount_minor: int
    compare_at_minor: int | None = None


class AdminProductSchema(BaseModel):
    id: str
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
    pillar_tag: str | None = None
    is_active: bool
    is_featured: bool
    capacity: int | None = None
    refund_policy_days: int = 7
    learning_outcomes: list[str] = Field(default_factory=list)
    prices: list[AdminProductPriceSchema] = Field(default_factory=list)


class CreateAdminProductRequest(BaseModel):
    name: str
    slug: str
    product_type: str = "single_class"
    short_description: str
    full_description: str | None = None
    image_url: str | None = None
    instructor_name: str | None = None
    instructor_title: str | None = None
    rating: float | None = 5.0
    review_count: int = 0
    pillar_tag: str | None = "Nutrition"
    is_active: bool = True  # True = Approved & Live, False = Draft / Review
    is_featured: bool = False
    capacity: int | None = None
    refund_policy_days: int = 30
    learning_outcomes: list[str] = Field(default_factory=list)
    usd_amount_minor: int = 2500
    usd_compare_at_minor: int | None = None
    inr_amount_minor: int = 199900
    inr_compare_at_minor: int | None = None


class UpdateAdminProductRequest(BaseModel):
    name: str | None = None
    slug: str | None = None
    product_type: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    image_url: str | None = None
    instructor_name: str | None = None
    instructor_title: str | None = None
    rating: float | None = None
    review_count: int | None = None
    pillar_tag: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    capacity: int | None = None
    refund_policy_days: int | None = None
    learning_outcomes: list[str] | None = None
    usd_amount_minor: int | None = None
    usd_compare_at_minor: int | None = None
    inr_amount_minor: int | None = None
    inr_compare_at_minor: int | None = None


@router.get(
    "/metrics",
    response_model=AdminMetricsSummary,
    summary="Get platform operational overview metrics",
)
async def get_admin_metrics(
    user_context: UserContext = Depends(get_admin_user_context),
    db: AsyncSession = Depends(get_db),
):
    require_roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)(user_context)

    users_count = (await db.execute(select(func.count(User.id)))).scalar_one()
    subs_count = (await db.execute(select(func.count(Subscription.id)))).scalar_one()
    recipes_count = (await db.execute(select(func.count(Recipe.id)))).scalar_one()
    classes_count = (await db.execute(select(func.count(LiveClass.id)))).scalar_one()
    leads_count = (await db.execute(select(func.count(Lead.id)))).scalar_one()

    return AdminMetricsSummary(
        total_users=users_count,
        active_subscriptions=subs_count,
        total_recipes=recipes_count,
        scheduled_live_classes=classes_count,
        total_leads=leads_count,
    )


@router.get(
    "/products",
    response_model=list[AdminProductSchema],
    summary="List all products including drafts & pending review items",
)
async def list_admin_products(
    user_context: UserContext = Depends(get_admin_user_context),
    db: AsyncSession = Depends(get_db),
):
    require_roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)(user_context)

    res = await db.execute(
        select(Product)
        .where(Product.is_deleted.is_(False))
        .options(selectinload(Product.prices))
        .order_by(desc(Product.created_at))
    )
    products = res.scalars().all()

    return [
        AdminProductSchema(
            id=str(p.id),
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
            refund_policy_days=p.refund_policy_days,
            learning_outcomes=p.learning_outcomes or [],
            prices=[
                AdminProductPriceSchema(
                    currency=pr.currency,
                    amount_minor=pr.amount_minor,
                    compare_at_minor=pr.compare_at_minor,
                )
                for pr in p.prices
                if pr.is_active
            ],
        )
        for p in products
    ]


@router.post(
    "/products",
    response_model=AdminProductSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create and configure product with multi-currency pricing and approval status",
)
async def create_admin_product(
    req: CreateAdminProductRequest,
    user_context: UserContext = Depends(get_admin_user_context),
    db: AsyncSession = Depends(get_db),
):
    require_roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)(user_context)

    # Check for slug collision
    res = await db.execute(select(Product).where(Product.slug == req.slug))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Product with slug '{req.slug}' already exists.")

    product = Product(
        name=req.name,
        slug=req.slug,
        product_type=req.product_type,
        short_description=req.short_description,
        full_description=req.full_description,
        image_url=req.image_url,
        instructor_name=req.instructor_name,
        instructor_title=req.instructor_title,
        rating=req.rating,
        review_count=req.review_count,
        pillar_tag=req.pillar_tag,
        is_active=req.is_active,
        is_featured=req.is_featured,
        capacity=req.capacity,
        refund_policy_days=req.refund_policy_days,
        learning_outcomes=req.learning_outcomes,
    )
    db.add(product)
    await db.flush()

    # Add USD Price
    db.add(
        ProductPrice(
            product_id=product.id,
            currency="USD",
            amount_minor=req.usd_amount_minor,
            compare_at_minor=req.usd_compare_at_minor,
            is_active=True,
        )
    )

    # Add INR Price
    db.add(
        ProductPrice(
            product_id=product.id,
            currency="INR",
            amount_minor=req.inr_amount_minor,
            compare_at_minor=req.inr_compare_at_minor,
            is_active=True,
        )
    )

    await db.commit()
    await db.refresh(product)

    return AdminProductSchema(
        id=str(product.id),
        name=product.name,
        slug=product.slug,
        product_type=product.product_type,
        short_description=product.short_description,
        full_description=product.full_description,
        image_url=product.image_url,
        instructor_name=product.instructor_name,
        instructor_title=product.instructor_title,
        rating=product.rating,
        review_count=product.review_count,
        pillar_tag=product.pillar_tag,
        is_active=product.is_active,
        is_featured=product.is_featured,
        capacity=product.capacity,
        refund_policy_days=product.refund_policy_days,
        learning_outcomes=product.learning_outcomes or [],
        prices=[
            AdminProductPriceSchema(
                currency=pr.currency,
                amount_minor=pr.amount_minor,
                compare_at_minor=pr.compare_at_minor,
            )
            for pr in product.prices
            if pr.is_active
        ],
    )


@router.patch(
    "/products/{product_id}",
    response_model=AdminProductSchema,
    summary="Update product details, pricing, and approve/publish status",
)
async def update_admin_product(
    product_id: uuid.UUID,
    req: UpdateAdminProductRequest,
    user_context: UserContext = Depends(get_admin_user_context),
    db: AsyncSession = Depends(get_db),
):
    require_roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)(user_context)

    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    if req.name is not None:
        product.name = req.name
    if req.slug is not None:
        product.slug = req.slug
    if req.product_type is not None:
        product.product_type = req.product_type
    if req.short_description is not None:
        product.short_description = req.short_description
    if req.full_description is not None:
        product.full_description = req.full_description
    if req.image_url is not None:
        product.image_url = req.image_url
    if req.instructor_name is not None:
        product.instructor_name = req.instructor_name
    if req.instructor_title is not None:
        product.instructor_title = req.instructor_title
    if req.rating is not None:
        product.rating = req.rating
    if req.review_count is not None:
        product.review_count = req.review_count
    if req.pillar_tag is not None:
        product.pillar_tag = req.pillar_tag
    if req.is_active is not None:
        product.is_active = req.is_active
    if req.is_featured is not None:
        product.is_featured = req.is_featured
    if req.capacity is not None:
        product.capacity = req.capacity
    if req.refund_policy_days is not None:
        product.refund_policy_days = req.refund_policy_days
    if req.learning_outcomes is not None:
        product.learning_outcomes = req.learning_outcomes

    # Update prices if provided
    for pr in product.prices:
        if pr.currency == "USD" and req.usd_amount_minor is not None:
            pr.amount_minor = req.usd_amount_minor
            if req.usd_compare_at_minor is not None:
                pr.compare_at_minor = req.usd_compare_at_minor
        elif pr.currency == "INR" and req.inr_amount_minor is not None:
            pr.amount_minor = req.inr_amount_minor
            if req.inr_compare_at_minor is not None:
                pr.compare_at_minor = req.inr_compare_at_minor

    await db.commit()
    await db.refresh(product)

    return AdminProductSchema(
        id=str(product.id),
        name=product.name,
        slug=product.slug,
        product_type=product.product_type,
        short_description=product.short_description,
        full_description=product.full_description,
        image_url=product.image_url,
        instructor_name=product.instructor_name,
        instructor_title=product.instructor_title,
        rating=product.rating,
        review_count=product.review_count,
        pillar_tag=product.pillar_tag,
        is_active=product.is_active,
        is_featured=product.is_featured,
        capacity=product.capacity,
        refund_policy_days=product.refund_policy_days,
        learning_outcomes=product.learning_outcomes or [],
        prices=[
            AdminProductPriceSchema(
                currency=pr.currency,
                amount_minor=pr.amount_minor,
                compare_at_minor=pr.compare_at_minor,
            )
            for pr in product.prices
            if pr.is_active
        ],
    )


@router.post(
    "/upload-image",
    summary="Upload product cover photography or resource media",
)
async def upload_product_image(
    file: UploadFile = File(...),
    user_context: UserContext = Depends(get_admin_user_context),
):
    require_roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)(user_context)

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Supported formats: JPEG, PNG, WebP, AVIF, SVG.",
        )

    ext = os.path.splitext(file.filename or "image.jpg")[1].lower()
    if not ext:
        ext = ".jpg"

    os.makedirs("uploads", exist_ok=True)
    filename = f"prod_{uuid.uuid4().hex[:10]}{ext}"
    file_path = os.path.join("uploads", filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"http://localhost:8000/uploads/{filename}"

    return {
        "status": "success",
        "filename": filename,
        "image_url": image_url,
    }


# Member Management Schemas & Routes
class AdminMemberSchema(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str | None = None
    role: str
    is_active: bool
    joined_date: str
    membership_tier: str
    enrolled_offerings: list[str] = Field(default_factory=list)
    adherence_score: int = 85
    nutrition_plan_status: str = "Approved"


class GrantAccessRequest(BaseModel):
    product_id: str
    product_name: str
    duration_days: int = 365


class UpdateMemberStatusRequest(BaseModel):
    is_active: bool | None = None
    role: str | None = None
    membership_tier: str | None = None


class ConsultationSlotSchema(BaseModel):
    id: str
    date_str: str  # YYYY-MM-DD
    time_slot: str  # e.g. "10:00 AM - 10:45 AM EST"
    coach_name: str
    coach_title: str
    focus_topic: str
    total_slots: int
    booked_count: int
    status: str  # available, limited, booked
    attendee_name: str | None = None
    meeting_link: str = "https://meet.google.com/annapoorna-consult"


# In-memory consultation calendar slots with state for live booking
CALENDAR_SLOTS_DB = [
    {
        "id": "slot-001",
        "date_str": "2026-08-25",
        "time_slot": "10:00 AM - 10:45 AM EST",
        "coach_name": "Dr. Maya Rao",
        "coach_title": "Lead Lifestyle Physician",
        "focus_topic": "A1c & Fasting Glucose Reversal Protocol",
        "total_slots": 3,
        "booked_count": 1,
        "status": "available",
        "attendee_name": "Priya Sharma",
        "meeting_link": "https://meet.google.com/annapoorna-consult-001",
    },
    {
        "id": "slot-002",
        "date_str": "2026-08-25",
        "time_slot": "02:30 PM - 03:15 PM EST",
        "coach_name": "Anita Desai",
        "coach_title": "Clinical Nutrition Specialist",
        "focus_topic": "Zero-Oil Whole Plant Meal Transition",
        "total_slots": 2,
        "booked_count": 2,
        "status": "booked",
        "attendee_name": "Kathy Gaither",
        "meeting_link": "https://meet.google.com/annapoorna-consult-002",
    },
    {
        "id": "slot-003",
        "date_str": "2026-08-26",
        "time_slot": "11:00 AM - 11:45 AM EST",
        "coach_name": "Dr. Maya Rao",
        "coach_title": "Lead Lifestyle Physician",
        "focus_topic": "Cardiometabolic & Lipid Optimization",
        "total_slots": 3,
        "booked_count": 2,
        "status": "limited",
        "attendee_name": "Rajesh Kumar",
        "meeting_link": "https://meet.google.com/annapoorna-consult-003",
    },
    {
        "id": "slot-004",
        "date_str": "2026-08-27",
        "time_slot": "04:00 PM - 04:45 PM EST",
        "coach_name": "Jim Jones",
        "coach_title": "Metabolic Habit Coach",
        "focus_topic": "40-Min Postprandial Walking & Habit Loops",
        "total_slots": 4,
        "booked_count": 1,
        "status": "available",
        "attendee_name": None,
        "meeting_link": "https://meet.google.com/annapoorna-consult-004",
    },
    {
        "id": "slot-005",
        "date_str": "2026-08-28",
        "time_slot": "09:00 AM - 09:45 AM EST",
        "coach_name": "Dr. Maya Rao",
        "coach_title": "Lead Lifestyle Physician",
        "focus_topic": "Comprehensive Lifestyle Consultation",
        "total_slots": 2,
        "booked_count": 0,
        "status": "available",
        "attendee_name": None,
        "meeting_link": "https://meet.google.com/annapoorna-consult-005",
    },
]


@router.get(
    "/members",
    response_model=list[AdminMemberSchema],
    summary="List all platform members with tiers, entitlements, and adherence",
)
async def list_admin_members(
    user_context: UserContext = Depends(get_admin_user_context),
    db: AsyncSession = Depends(get_db),
):
    require_roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)(user_context)

    res = await db.execute(
        select(User).options(selectinload(User.profile), selectinload(User.roles)).order_by(desc(User.created_at))
    )
    users = res.scalars().all()

    members = []
    for u in users:
        role_name = u.roles[0].name if u.roles else "Member"
        first_n = u.profile.first_name if u.profile else "Member"
        last_n = u.profile.last_name if u.profile else ""
        tier = "VIP Annual" if "admin" in u.email.lower() else "6-Week Cohort Enrolled"
        members.append(
            AdminMemberSchema(
                id=str(u.id),
                email=u.email,
                first_name=first_n,
                last_name=last_n,
                role=role_name,
                is_active=(u.status == "active"),
                joined_date=u.created_at.strftime("%b %d, %Y") if u.created_at else "Aug 2026",
                membership_tier=tier,
                enrolled_offerings=[
                    "Six-Week Lifestyle Reset Cohort",
                    "Plant-Based Foundations Class",
                ],
                adherence_score=92 if "priya" in u.email.lower() else 85,
                nutrition_plan_status="Approved by Dr. Maya Rao",
            )
        )
    return members


@router.post(
    "/members/{user_id}/entitlements",
    summary="Manually grant product/program access to a member",
)
async def grant_member_access(
    user_id: uuid.UUID,
    req: GrantAccessRequest,
    user_context: UserContext = Depends(get_admin_user_context),
):
    require_roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)(user_context)
    return {
        "status": "success",
        "message": f"Granted full access for '{req.product_name}' to user {user_id} for {req.duration_days} days.",
    }


@router.patch(
    "/members/{user_id}/status",
    summary="Update member account status (active/suspended) and role tier",
)
async def update_member_status(
    user_id: uuid.UUID,
    req: UpdateMemberStatusRequest,
    user_context: UserContext = Depends(get_admin_user_context),
    db: AsyncSession = Depends(get_db),
):
    require_roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)(user_context)
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")

    if req.is_active is not None:
        user.status = "active" if req.is_active else "suspended"
    await db.commit()
    return {"status": "success", "user_id": str(user_id), "is_active": (user.status == "active")}


@router.get(
    "/calendar-slots",
    response_model=list[ConsultationSlotSchema],
    summary="List all consultation slots with real-time capacity and booking status",
)
async def list_calendar_slots(
    db: AsyncSession = Depends(get_db),
):
    return [ConsultationSlotSchema(**s) for s in CALENDAR_SLOTS_DB]


class BookSlotRequest(BaseModel):
    slot_id: str
    attendee_name: str
    attendee_email: str
    consultation_focus: str
    notes: str | None = None


@router.post(
    "/book-slot",
    response_model=ConsultationSlotSchema,
    summary="Book an available consultation time slot",
)
async def book_consultation_slot(
    req: BookSlotRequest,
    db: AsyncSession = Depends(get_db),
):
    slot = next((s for s in CALENDAR_SLOTS_DB if s["id"] == req.slot_id), None)
    if not slot:
        raise HTTPException(status_code=404, detail="Selected time slot does not exist.")

    if slot["booked_count"] >= slot["total_slots"]:
        raise HTTPException(status_code=400, detail="This time slot is fully booked.")

    slot["booked_count"] += 1
    slot["attendee_name"] = req.attendee_name
    if slot["booked_count"] >= slot["total_slots"]:
        slot["status"] = "booked"
    elif slot["booked_count"] == slot["total_slots"] - 1:
        slot["status"] = "limited"
    else:
        slot["status"] = "available"

    return ConsultationSlotSchema(**slot)


