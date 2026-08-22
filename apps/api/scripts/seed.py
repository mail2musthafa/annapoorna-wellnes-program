"""Comprehensive Idempotent Database Seeder for Annapoorna Portal."""

import asyncio
import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.constants import DEFAULT_ROLE_PERMISSIONS, PermissionCode, RoleName
from app.core.security import get_password_hash
from app.db.base import Base
from app.modules.commerce.models import Product, ProductPrice
from app.modules.community.models import Comment, CommunitySpace, Post, Reaction
from app.modules.enquiries.models import Enquiry, LeadActivity, LeadTask
from app.modules.nutrition_plans.models import ExpertReview, NutritionPlan, NutritionPlanVersion
from app.modules.pillars.models import Pillar, PillarGoal
from app.modules.recipes.models import Ingredient, Recipe, RecipeIngredient
from app.modules.roles.models import Permission, Role, RolePermission, UserRole
from app.modules.scheduling.models import ClassSession, InstructorProfile
from app.modules.users.models import User, UserProfile
from app.shared.enums import UserStatus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("annapoorna.seeder")


async def seed_data(db: AsyncSession) -> None:
    logger.info("🌱 Starting Annapoorna Portal Comprehensive Database Seed...")

    # 1. Permissions & Roles
    permission_map: dict[str, Permission] = {}
    for code in PermissionCode:
        res = await db.execute(select(Permission).where(Permission.code == code.value))
        perm = res.scalar_one_or_none()
        if not perm:
            perm = Permission(
                code=code.value,
                name=code.name.replace("_", " ").title(),
                category=code.value.split(".")[0],
                description=f"Permission to {code.name.replace('_', ' ').lower()}",
            )
            db.add(perm)
            await db.flush()
        permission_map[code.value] = perm

    role_map: dict[str, Role] = {}
    for role_name in RoleName:
        res = await db.execute(select(Role).where(Role.name == role_name.value))
        role = res.scalar_one_or_none()
        if not role:
            role = Role(name=role_name.value, description=f"{role_name.value} access role")
            db.add(role)
            await db.flush()
        role_map[role_name.value] = role

        assigned_codes = DEFAULT_ROLE_PERMISSIONS.get(role_name, [])
        for p_code in assigned_codes:
            p_val = p_code.value if hasattr(p_code, "value") else str(p_code)
            perm = permission_map.get(p_val)
            if perm:
                existing_link = await db.execute(
                    select(RolePermission).where(
                        RolePermission.role_id == role.id,
                        RolePermission.permission_id == perm.id,
                    )
                )
                if not existing_link.scalar_one_or_none():
                    db.add(RolePermission(role_id=role.id, permission_id=perm.id))

    # 2. Demo Experts
    demo_experts_data = [
        ("shobha@annapoorna.local", "Shobha", "Swamy", "Lead Plant-Based Nutrition Instructor", "Specialist in anti-inflammatory culinary medicine and whole plant nutrition."),
        ("maya@annapoorna.local", "Dr. Maya", "Rao", "Wellness Program Advisor", "Integrative lifestyle health physician focusing on circadian sleep and metabolic health."),
        ("ananya@annapoorna.local", "Ananya", "Mehta", "Registered Dietitian (Demo Profile)", "Evidence-based dietitian specializing in gut microbiome diversity and plant meal planning."),
        ("kavita@annapoorna.local", "Kavita", "Nair", "Mindfulness & Pranayama Instructor", "Master teacher in yogic breathwork, vagus nerve stimulation, and meditation."),
        ("arjun@annapoorna.local", "Arjun", "Reddy", "Functional Movement Coach", "Certified strength and mobility coach emphasizing longevity and joint mobility."),
    ]

    expert_users: list[User] = []
    for email, fn, ln, headline, bio in demo_experts_data:
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        if not user:
            user = User(email=email, hashed_password=get_password_hash("CoachPass123!"), status=UserStatus.ACTIVE, is_email_verified=True)
            db.add(user)
            await db.flush()
            db.add(UserProfile(user_id=user.id, first_name=fn, last_name=ln, timezone="Asia/Kolkata"))
            db.add(UserRole(user_id=user.id, role_id=role_map[RoleName.COACH.value].id))
            db.add(InstructorProfile(user_id=user.id, display_name=f"{fn} {ln}", headline=headline, bio=bio, iana_timezone="Asia/Kolkata"))
        expert_users.append(user)

    # 3. Demo Members
    demo_members_data = [
        ("priya.sharma@example.com", "Priya", "Sharma"),
        ("rahul.verma@example.com", "Rahul", "Verma"),
        ("aisha.khan@example.com", "Aisha", "Khan"),
        ("neha.reddy@example.com", "Neha", "Reddy"),
        ("daniel.thomas@example.com", "Daniel", "Thomas"),
        ("member@annapoorna.local", "Ananya", "Member"),
        ("admin@annapoorna.local", "Super", "Admin"),
    ]

    member_users: list[User] = []
    for email, fn, ln in demo_members_data:
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        if not user:
            pwd = "AdminPass123!" if "admin" in email else "MemberPass123!"
            user = User(email=email, hashed_password=get_password_hash(pwd), status=UserStatus.ACTIVE, is_email_verified=True)
            db.add(user)
            await db.flush()
            db.add(UserProfile(user_id=user.id, first_name=fn, last_name=ln, timezone="Asia/Kolkata"))
            role_id = role_map[RoleName.SUPER_ADMIN.value].id if "admin" in email else role_map[RoleName.MEMBER.value].id
            db.add(UserRole(user_id=user.id, role_id=role_id))
        member_users.append(user)

    # 4. Six Lifestyle Pillars
    pillars_data = [
        ("Nutrition", "nutrition", "Whole food, plant-predominant nourishment for metabolic health", 1),
        ("Movement", "movement", "Consistent, enjoyable daily physical activity and functional mobility", 2),
        ("Restorative Sleep", "restorative-sleep", "Circadian alignment and high-quality recovery sleep", 3),
        ("Mindfulness", "mindfulness", "Breathwork, meditation, and down-regulation of chronic stress", 4),
        ("Relationships & Community", "relationships-community", "Empathetic social connection and peer accountability", 5),
        ("Avoidance of Risky Substances", "avoidance-of-risky-substances", "Positive habit replacement and toxin-free living", 6),
    ]

    for name, slug, desc, order in pillars_data:
        res = await db.execute(select(Pillar).where(Pillar.slug == slug))
        if not res.scalar_one_or_none():
            pillar = Pillar(
                name=name,
                slug=slug,
                tagline=desc,
                description=desc,
                display_order=order,
                icon_name=slug,
                education_summary="Structured video modules and guided masterclasses.",
                management_summary="Daily habit tracking and personalized planning.",
                analysis_summary="Non-diagnostic trend logging and reflection.",
            )
            db.add(pillar)
            await db.flush()
            db.add(PillarGoal(pillar_id=pillar.id, title=f"Practice Daily {name}", description=f"Dedicate 20 minutes to {name.lower()}."))

    # 5. Multi-Currency Products (11 Required Product Types)
    products_data = [
        ("Plant-Based Foundations Live Class", "plant-based-foundations-class", "single_class", "Interactive 60-min live cooking class on whole plant basics.", 2500, 199900, "Shobha Swamy", "Lead Nutritionist", 4.9, 128, "Nutrition", 30, "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"),
        ("Indian Whole-Food Cooking Workshop", "indian-whole-food-workshop", "workshop", "Master anti-inflammatory Indian curries, dals, and rotis with zero oil.", 4500, 349900, "Shobha Swamy", "Lead Nutritionist", 4.95, 210, "Nutrition", 25, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"),
        ("Restorative Sleep Masterclass", "restorative-sleep-masterclass", "single_class", "Circadian biology, blue-light curfew, and evening breathwork.", 2500, 199900, "Dr. Maya Rao", "Lifestyle Physician", 4.85, 84, "Restorative Sleep", 40, "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"),
        ("Mindful Eating & Pranayama Workshop", "mindful-eating-workshop", "workshop", "Develop a peaceful relationship with meals through breathwork and mindfulness.", 3500, 249900, "Kavita Nair", "Mindfulness Instructor", 4.92, 115, "Mindfulness", 20, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"),
        ("Six-Week Lifestyle Reset Program", "six-week-lifestyle-reset", "program", "Transformative 6-week cohort covering all six lifestyle medicine pillars.", 14900, 1199900, "Dr. Maya Rao", "Lifestyle Physician", 5.0, 62, "Nutrition", 50, "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80"),
        ("Personal Nutrition Consultation", "personal-nutrition-consultation", "consultation", "1-on-1 personalized 45-min dietary assessment with a certified dietitian.", 7500, 599900, "Ananya Mehta", "Registered Dietitian", 4.98, 48, "Nutrition", 1, "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"),
        ("3-Month Lifestyle & Habit Coaching", "3-month-habit-coaching", "coaching_package", "Bi-weekly 1-on-1 coaching sessions with habit accountability tracking.", 29900, 2499900, "Dr. Maya Rao", "Lifestyle Physician", 5.0, 32, "Community", 1, "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"),
        ("The Science of Whole Food Nutrition", "science-of-whole-food-nutrition", "course", "Comprehensive 8-module self-paced video course with practical cooking labs.", 8900, 699900, "Shobha Swamy", "Lead Nutritionist", 4.9, 156, "Nutrition", None, "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80"),
        ("Seven-Day Whole-Food Meal Plan", "seven-day-whole-food-meal-plan", "meal_plan_package", "Complete digital recipe book, shopping list, and batch prep guide.", 1900, 149900, "Shobha Swamy", "Lead Nutritionist", 4.88, 92, "Nutrition", None, "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80"),
        ("50 Essential Healing Recipes Bundle", "50-essential-healing-recipes", "recipe_bundle", "Curated digital recipe bundle for gut health and inflammation reduction.", 2900, 229900, "Shobha Swamy", "Lead Nutritionist", 4.94, 180, "Nutrition", None, "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80"),
        ("Complete Plant-Based Starter Guide", "complete-plant-based-guide", "downloadable_guide", "Definitive 40-page starter handbook, pantry staples, and substitution guide.", 900, 69900, "Annapoorna Faculty", "Clinical Team", 4.8, 310, "Nutrition", None, "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80"),
        ("Annapoorna Monthly Membership", "annapoorna-monthly-membership", "membership_monthly", "Unlimited access to live classes, recipe library, and community spaces.", 2900, 229900, "Annapoorna Faculty", "Clinical Team", 4.95, 410, "Community", None, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"),
        ("Annapoorna Annual VIP Membership", "annapoorna-annual-membership", "membership_annual", "Full year access to all live classes, recordings, priority workshops, and VIP circle.", 29900, 2399900, "Annapoorna Faculty", "Clinical Team", 5.0, 240, "Community", None, "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"),
    ]

    product_map: dict[str, Product] = {}
    for name, slug, p_type, desc, usd_cents, inr_paise, instr, title, rating, rev_count, pillar, cap, img_url in products_data:
        res = await db.execute(select(Product).where(Product.slug == slug))
        prod = res.scalar_one_or_none()
        if not prod:
            prod = Product(
                name=name,
                slug=slug,
                product_type=p_type,
                short_description=desc,
                full_description=desc + " Includes downloadable PDF resources, structured guidance, and verified expert support.",
                image_url=img_url,
                instructor_name=instr,
                instructor_title=title,
                rating=rating,
                review_count=rev_count,
                pillar_tag=pillar,
                capacity=cap,
                is_active=True,
                is_featured=True,
                learning_outcomes=["Understand evidence-based lifestyle principles", "Master practical culinary and habit skills", "Direct access to expert Q&A"],
                what_is_included=["Interactive instruction", "Downloadable handbook", "Community circle access", "Certificate of completion"],
                requirements=["No previous cooking or medical background required", "Internet connection for live video"],
                suitable_audience="Anyone looking to improve metabolic health, longevity, and whole-plant vitality.",
            )
            db.add(prod)
            await db.flush()
            db.add(ProductPrice(product_id=prod.id, currency="USD", amount_minor=usd_cents, compare_at_minor=int(usd_cents * 1.25)))
            db.add(ProductPrice(product_id=prod.id, currency="INR", amount_minor=inr_paise, compare_at_minor=int(inr_paise * 1.25)))
        product_map[slug] = prod

    # 6. Scheduled Class Sessions (12 Sessions Across Timezones)
    now = datetime.now(UTC)
    sessions_data = [
        ("Morning Pranayama & Breathwork Flow", "morning-pranayama-flow", 1, 9, 60, "Asia/Kolkata", 25, "Kavita Nair", "plant-based-foundations-class"),
        ("Ayurvedic Anti-Inflammatory Cooking", "ayurvedic-cooking-live", 2, 11, 75, "Asia/Kolkata", 30, "Shobha Swamy", "indian-whole-food-workshop"),
        ("Circadian Rhythm & Deep Sleep Optimization", "circadian-sleep-class", 3, 18, 60, "America/New_York", 40, "Dr. Maya Rao", "restorative-sleep-masterclass"),
        ("Mindful Eating Masterclass & Tea Meditation", "mindful-eating-tea-meditation", 4, 15, 60, "Europe/London", 20, "Kavita Nair", "mindful-eating-workshop"),
        ("Joint Mobility & Functional Vigor", "joint-mobility-functional-vigor", 5, 8, 45, "Asia/Kolkata", 35, "Arjun Reddy", "plant-based-foundations-class"),
        ("Whole-Food Oil-Free Curry Essentials", "oil-free-curry-essentials", 6, 17, 90, "Asia/Kolkata", 25, "Shobha Swamy", "indian-whole-food-workshop"),
        ("Evening Restorative Yoga & Sleep Yoga Nidra", "evening-sleep-yoga-nidra", 7, 20, 60, "Asia/Kolkata", 50, "Kavita Nair", "restorative-sleep-masterclass"),
        ("Plant Protein & Satiety Blueprint", "plant-protein-satiety-blueprint", 8, 14, 60, "America/New_York", 30, "Ananya Mehta", "plant-based-foundations-class"),
        ("Longevity Breathwork & Vagus Nerve Mastery", "vagus-nerve-mastery", 9, 10, 60, "Asia/Kolkata", 30, "Kavita Nair", "mindful-eating-workshop"),
        ("Anti-Inflammatory Kitchen Prep & Batch Cooking", "kitchen-prep-batch-cooking", 10, 16, 75, "Asia/Kolkata", 25, "Shobha Swamy", "indian-whole-food-workshop"),
        ("Core Stability & Posture Realignment", "core-stability-posture", 11, 9, 45, "Europe/London", 30, "Arjun Reddy", "plant-based-foundations-class"),
        ("Holistic Stress Resilience & Heart Coherence", "stress-resilience-heart-coherence", 12, 19, 60, "America/New_York", 40, "Dr. Maya Rao", "restorative-sleep-masterclass"),
    ]

    for title, slug, days_offset, hour, duration, tz, capacity, instructor, prod_slug in sessions_data:
        res = await db.execute(select(ClassSession).where(ClassSession.slug == slug))
        if not res.scalar_one_or_none():
            start_dt = now.replace(minute=0, second=0, microsecond=0) + timedelta(days=days_offset, hours=hour)
            parent_prod = product_map.get(prod_slug) or list(product_map.values())[0]
            session = ClassSession(
                product_id=parent_prod.id,
                title=title,
                slug=slug,
                description=f"Live interactive masterclass led by {instructor} with live Q&A and practical takeaways.",
                start_time=start_dt,
                end_time=start_dt + timedelta(minutes=duration),
                duration_minutes=duration,
                iana_timezone=tz,
                capacity=capacity,
                confirmed_count=2,
                held_count=0,
                meeting_provider="zoom",
                meeting_url="https://meet.annapoorna.wellness/live-room",
                status="scheduled",
            )
            db.add(session)

    # 7. CRM Enquiries (20 Detailed Leads Across Stages)
    enquiries_data = [
        ("Siddharth", "Mehra", "siddharth@example.com", "+91 98765 43210", "free_guide", "Six-Week Lifestyle Reset", "Downloaded free starter guide from Instagram campaign.", "new", "normal"),
        ("Meera", "Iyer", "meera.iyer@example.com", "+91 98234 56789", "discovery_call", "Personal Nutrition Consultation", "Looking for guidance managing blood sugar through whole plants.", "discovery_call_booked", "high"),
        ("Vikram", "Kapoor", "vikram.k@example.com", "+91 97123 45678", "contact_form", "Plant-Based Foundations Live Class", "Want to know if cooking ingredients can be substituted for nut allergies.", "contacted", "normal"),
        ("Sunita", "Deshmukh", "sunita.d@example.com", "+91 98450 12345", "class_enquiry", "Indian Whole-Food Cooking Workshop", "Enquiring about group corporate workshop booking.", "qualified", "high"),
        ("Rohan", "Gupta", "rohan.g@example.com", "+91 99887 76655", "abandoned_cart", "Annapoorna Monthly Membership", "Cart abandoned on payment screen.", "follow_up_required", "urgent"),
        ("Deepika", "Nair", "deepika.nair@example.com", "+91 91234 87654", "free_guide", "Six-Week Lifestyle Reset", "Requested recipe booklet. Interested in weekly meal planning.", "contacted", "normal"),
        ("Amit", "Patel", "amit.patel@example.com", "+91 98980 11223", "discovery_call", "Six-Week Lifestyle Reset", "Enrolled after discovery call with Dr. Maya Rao.", "converted", "normal"),
        ("Kavita", "Joshi", "kavita.j@example.com", "+91 97654 32109", "failed_payment", "Indian Whole-Food Cooking Workshop", "Card declined by issuing bank during checkout.", "follow_up_required", "urgent"),
        ("Tarun", "Sen", "tarun.sen@example.com", "+91 96543 21098", "contact_form", "Restorative Sleep Masterclass", "Looking for evening session options in UK timezone.", "contacted", "normal"),
        ("Anjali", "Bose", "anjali.bose@example.com", "+91 95432 10987", "free_guide", "Plant-Based Foundations Live Class", "Downloaded starter guide. Opened email sequence.", "qualified", "normal"),
        ("Gaurav", "Malhotra", "gaurav.m@example.com", "+91 94321 09876", "discovery_call", "Personal Nutrition Consultation", "Wants 1-on-1 session with dietitian Ananya Mehta.", "discovery_call_booked", "high"),
        ("Pooja", "Chopra", "pooja.c@example.com", "+91 93210 98765", "class_enquiry", "Mindful Eating Workshop", "Interested in mindful eating for stress reduction.", "new", "normal"),
        ("Karan", "Bhatia", "karan.bhatia@example.com", "+91 92109 87654", "abandoned_cart", "Six-Week Lifestyle Reset", "Visited checkout page twice today.", "follow_up_required", "high"),
        ("Shilpa", "Shetty", "shilpa.s@example.com", "+91 91098 76543", "contact_form", "General Enquiry", "Asked about speaking engagement with founder Shobha Swamy.", "qualified", "normal"),
        ("Rajesh", "Nambiar", "rajesh.n@example.com", "+91 90987 65432", "free_guide", "Seven-Day Whole-Food Meal Plan", "Downloaded guide. No response to email follow-up.", "unresponsive", "low"),
        ("Sneha", "Kulkarni", "sneha.k@example.com", "+91 98877 66554", "discovery_call", "Six-Week Lifestyle Reset", "Decided to wait for next quarter cohort.", "not_interested", "low"),
        ("Manish", "Saxena", "manish.s@example.com", "+91 97766 55443", "contact_form", "Annapoorna Monthly Membership", "Successfully joined monthly membership.", "converted", "normal"),
        ("Ritu", "Agarwal", "ritu.a@example.com", "+91 96655 44332", "class_enquiry", "Plant-Based Foundations Live Class", "Attended live class with rave feedback.", "converted", "normal"),
        ("Naveen", "Prasad", "naveen.p@example.com", "+91 95544 33221", "free_guide", "Six-Week Lifestyle Reset", "New download from Google search.", "new", "normal"),
        ("Divya", "Menon", "divya.m@example.com", "+91 94433 22110", "discovery_call", "Personal Nutrition Consultation", "Requested consultation next Tuesday at 4 PM.", "discovery_call_booked", "high"),
    ]

    for fn, ln, email, phone, etype, prod_name, msg, status_str, priority_str in enquiries_data:
        res = await db.execute(select(Enquiry).where(Enquiry.email == email))
        if not res.scalar_one_or_none():
            enq = Enquiry(
                first_name=fn,
                last_name=ln,
                email=email,
                phone=phone,
                country="India",
                enquiry_type=etype,
                interested_product=prod_name,
                message=msg,
                status=status_str,
                priority=priority_str,
                assigned_staff_name="Dr. Maya Rao" if "Lifestyle" in prod_name else "Shobha Swamy",
                internal_notes=f"Initial lead captured via {etype.replace('_', ' ').title()}.",
                follow_up_date=now + timedelta(days=2),
                conversion_value_minor=1199900 if status_str == "converted" else None,
            )
            db.add(enq)
            await db.flush()

            db.add(
                LeadActivity(
                    enquiry_id=enq.id,
                    actor_name="CRM Ingestion",
                    activity_type="enquiry_created",
                    summary=f"Inbound {etype.replace('_', ' ').title()} lead created",
                    details=msg,
                )
            )
            if status_str in ["new", "follow_up_required", "discovery_call_booked"]:
                db.add(
                    LeadTask(
                        enquiry_id=enq.id,
                        title=f"Follow up with {fn} {ln} regarding {prod_name}",
                        due_date=now + timedelta(days=1),
                        assigned_to_name=enq.assigned_staff_name,
                    )
                )

    # 8. 12 Recipes & 2 Meal Plans
    sample_recipes = [
        ("Ayurvedic Golden Kitchari", "ayurvedic-golden-kitchari", "A gentle, deeply nourishing one-pot stew of yellow split mung dal, basmati rice, turmeric, and ginger.", 15, 30, 340, 14, 58, 6, 8, ["Gluten-Free", "High-Fiber", "Ayurvedic"]),
        ("Raw Rainbow Crunch Salad", "raw-rainbow-crunch-salad", "Shredded purple cabbage, carrots, edamame, and toasted sesame seeds with ginger-tahini dressing.", 20, 0, 290, 12, 28, 16, 9, ["Raw", "Vegan", "Gut-Health"]),
        ("Sweet Potato & Chickpea Coconut Curry", "sweet-potato-chickpea-curry", "Hearty chickpeas simmered with Japanese sweet potatoes, mustard seeds, and creamy coconut milk.", 15, 25, 380, 15, 52, 12, 11, ["High-Protein", "Plant-Based"]),
        ("Spiced Moong Sprout & Pomegranate Chaat", "moong-sprout-pomegranate-chaat", "Crisp steamed sprouted moong tossed with ruby pomegranate pearls, cumin, and lime.", 10, 5, 220, 10, 38, 2, 7, ["Prebiotic", "Low-Fat"]),
        ("Creamy Golden Turmeric Golden Milk", "creamy-golden-turmeric-milk", "Warming almond milk simmered with fresh turmeric, black pepper, cardamom, and Ceylon cinnamon.", 5, 5, 130, 3, 12, 7, 2, ["Sleep-Enhancing", "Anti-Inflammatory"]),
        ("Steamed Millet & Spinach Idlis", "steamed-millet-spinach-idlis", "Fermented foxtail millet and baby spinach cakes steamed to fluffy perfection with coconut chutney.", 20, 15, 260, 8, 48, 4, 6, ["Fermented", "Gut-Health"]),
        ("Roasted Beetroot & Walnut Hummus", "beetroot-walnut-hummus", "Vibrant roasted red beet hummus blended with toasted walnuts, garlic, and fresh lemon.", 15, 0, 210, 6, 18, 14, 5, ["Antioxidant-Rich", "Vegan"]),
        ("Cardamom Infused Warm Quinoa Porridge", "cardamom-warm-quinoa-porridge", "Fluffy quinoa cooked in oat milk with crushed cardamom, stewed apples, and chia seeds.", 10, 15, 310, 10, 50, 7, 8, ["High-Protein", "Gluten-Free"]),
        ("Slow-Simmered Black Bean & Tomato Chili", "black-bean-tomato-chili", "Rich, smoky black bean chili infused with roasted cumin, oregano, and sweet corn.", 15, 35, 360, 18, 62, 4, 16, ["High-Fiber", "Heart-Healthy"]),
        ("Zesty Lemon Tahini Massaged Kale Bowl", "massaged-kale-tahini-bowl", "Tender organic Tuscan kale massaged with lemon juice, nutritional yeast, and roasted pepitas.", 15, 0, 240, 9, 16, 17, 6, ["Iron-Rich", "Raw"]),
        ("Steamed Methi Thepla (Zero-Oil Fenugreek Flatbreads)", "zero-oil-methi-thepla", "Whole wheat and chickpea flatbreads packed with fresh fenugreek greens and ajwain seeds.", 20, 15, 190, 7, 36, 2, 6, ["Blood-Sugar-Friendly"]),
        ("Chia Seed & Wild Berry Parfait", "chia-seed-wild-berry-parfait", "Coconut yogurt layered with overnight chia seed pudding and warm stewed antioxidant blueberries.", 10, 0, 230, 6, 28, 11, 8, ["Omega-3", "Digestive-Health"]),
    ]

    for title, slug, summary, prep, cook, cal, prot, carb, fat, fib, tags in sample_recipes:
        res = await db.execute(select(Recipe).where(Recipe.slug == slug))
        if not res.scalar_one_or_none():
            recipe = Recipe(
                title=title,
                slug=slug,
                summary=summary,
                instructions=[
                    "Prepare all organic plant ingredients and wash thoroughly.",
                    "Gently combine ingredients and simmer over medium flame for maximum nutrient preservation.",
                    "Garnish with fresh organic herbs and savor each mindful mouthful.",
                ],
                prep_time_minutes=prep,
                cook_time_minutes=cook,
                servings=4,
                calories=cal,
                protein_grams=prot,
                carbs_grams=carb,
                fat_grams=fat,
                fiber_grams=fib,
                tags=tags,
                is_public=True,
            )
            db.add(recipe)
            await db.flush()

            ing_name = f"Organic {title.split()[0]} Base"
            res_ing = await db.execute(select(Ingredient).where(Ingredient.name == ing_name))
            ing = res_ing.scalar_one_or_none()
            if not ing:
                ing = Ingredient(name=ing_name, category="Pantry", is_common_allergen=False)
                db.add(ing)
                await db.flush()

            db.add(RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ing.id,
                ingredient_name=ing.name,
                quantity="250g",
                notes="Organic and fresh",
                display_order=1,
            ))

    # 9. 2-Stage Nutrition Plan for Demo Member
    demo_member = member_users[0]
    res = await db.execute(select(NutritionPlan).where(NutritionPlan.user_id == demo_member.id))
    if not res.scalar_one_or_none():
        plan = NutritionPlan(
            user_id=demo_member.id,
            assigned_expert_id=expert_users[0].id,
            title="6-Week Metabolic Vitality & Anti-Inflammatory Nutrition Plan",
            objective="Metabolic Optimization & Sustained Energy",
            status="approved",
            is_active=True,
        )
        db.add(plan)
        await db.flush()

        version = NutritionPlanVersion(
            plan_id=plan.id,
            version_number=1,
            daily_calorie_target=1850,
            protein_grams=75,
            carbs_grams=250,
            fat_grams=45,
            fiber_grams=45,
            dietary_preferences=["Whole-Food Plant-Based", "Gluten-Free", "Low-Glycemic"],
            allergies_and_exclusions=["Peanuts", "Refined Sugars"],
            recommended_meals=[
                {"slot": "Breakfast", "title": "Warm Cardamom Quinoa Porridge with Chia", "calories": 350},
                {"slot": "Lunch", "title": "Ayurvedic Golden Kitchari with Steamed Greens", "calories": 450},
                {"slot": "Dinner", "title": "Sweet Potato Chickpea Coconut Bowl", "calories": 480},
            ],
            shopping_list_items=["Yellow split mung dal", "Organic quinoa", "Japanese sweet potatoes", "Ground flaxseeds", "Almond milk"],
            hydration_guidelines="Drink 3 Liters of warm filtered water daily with lemon and ginger slices.",
        )
        db.add(version)

        review = ExpertReview(
            plan_id=plan.id,
            expert_id=expert_users[0].id,
            expert_name="Shobha Swamy (Lead Nutritionist)",
            decision="approved",
            member_visible_notes="Plan approved. Excellent macronutrient and prebiotic fiber balance for sustained energy.",
            private_clinical_notes="Member reports good compliance. Monitor hydration during morning exercise.",
            next_review_date=now + timedelta(days=30),
        )
        db.add(review)

    # 10. Community Spaces & Rich LinkedIn/MDU-Style Posts
    spaces_data = [
        ("Nourishment & Recipes", "recipes-circle", "Share whole-plant cooking discoveries, meal photos, and nutrition questions."),
        ("Movement & Vigor", "movement-circle", "Daily movement streaks, 40-min walking buddies, and mobility achievements."),
        ("Metabolic Vitality & CGM", "metabolic-vitality", "Continuous glucose insights, fasting readings, and clinical biomarker wins."),
    ]
    space_objs: list[CommunitySpace] = []
    for s_name, s_slug, s_desc in spaces_data:
        res = await db.execute(select(CommunitySpace).where(CommunitySpace.slug == s_slug))
        space = res.scalar_one_or_none()
        if not space:
            space = CommunitySpace(name=s_name, slug=s_slug, description=s_desc, is_private=False)
            db.add(space)
            await db.flush()
        space_objs.append(space)

    # Add Kathy Gaither's Multi-Image CGM & Walking Buddy Post (matching the exact reference screenshot!)
    post1 = Post(
        space_id=space_objs[0].id,
        author_id=demo_member.id,
        title="Food journal, CGM and a picture of my walking buddy (40 min walk) for 8-20-26",
        content="Food journal, CGM and a picture of my walking buddy (40 min walk) for 8-20-26. 4 weeks in and feeling incredible energy! Fasting glucose was 98 mg/dL this morning with zero midday crashes. Thank you Dr. Maya and Shobha Swamy for the recipe blueprints!",
        media_urls=[
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",  # CGM graph / data chart
            "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",  # Journal checklist
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",  # Walking buddy dog
        ],
        pillar_tag="Nutrition & Movement",
        post_type="journal",
        is_pinned=True,
    )
    db.add(post1)
    await db.flush()

    # Add reactions to post1
    for expert in expert_users:
        db.add(Reaction(post_id=post1.id, user_id=expert.id, reaction_type="🔥"))
    db.add(Reaction(post_id=post1.id, user_id=member_users[0].id, reaction_type="❤️"))
    db.add(Reaction(post_id=post1.id, user_id=member_users[1].id, reaction_type="👏"))

    # Add comments to post1 (matching "James (Jim) Jones commented on this 30m ago")
    db.add(Comment(
        post_id=post1.id,
        author_id=expert_users[0].id,
        content="James (Jim) Jones: What an inspiring update! Seeing that steady 98 mg/dL flatline proves the power of intact plant fiber.",
    ))
    db.add(Comment(
        post_id=post1.id,
        author_id=expert_users[1].id,
        content="Dr. Maya Rao: Outstanding consistency Kathy! The 40-minute post-meal walk directly enhances insulin receptor sensitivity. Keep it up! 👏",
    ))

    # Add Post 2: Delicious Anti-Inflammatory Lunch discovery
    post2 = Post(
        space_id=space_objs[0].id,
        author_id=expert_users[1].id,
        title="Zero-Oil Anti-Inflammatory Adobo Mung Dal Bowl",
        content="Made the Blue Zone Adobo Mung Dal bowl from yesterday's live masterclass! Added roasted sweet potatoes and fresh cumin tadka. Kids loved it too! 🌿🍲",
        media_urls=[
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
        ],
        pillar_tag="Nutrition",
        post_type="meal_pic",
    )
    db.add(post2)
    await db.flush()
    db.add(Reaction(post_id=post2.id, user_id=member_users[0].id, reaction_type="🥗"))
    db.add(Reaction(post_id=post2.id, user_id=expert_users[0].id, reaction_type="🔥"))

    await db.commit()
    logger.info("✅ Annapoorna Portal database seeded successfully with all required entities!")


async def main():
    db_url = settings.DATABASE_URL
    connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}
    engine = create_async_engine(db_url, connect_args=connect_args, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with async_session() as session:
        await seed_data(session)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
