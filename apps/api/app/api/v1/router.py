"""Aggregated API v1 Router."""

from fastapi import APIRouter

from app.modules.admin.router import router as admin_router
from app.modules.auth.router import router as auth_router
from app.modules.coaching.router import router as coaching_router
from app.modules.commerce.router import router as commerce_router
from app.modules.community.router import router as community_router
from app.modules.content.router import router as content_router
from app.modules.courses.router import router as courses_router
from app.modules.enquiries.router import router as enquiries_router
from app.modules.leads.router import router as leads_router
from app.modules.live_classes.router import router as live_classes_router
from app.modules.meal_plans.router import router as meal_plans_router
from app.modules.media.router import router as media_router
from app.modules.memberships.router import router as memberships_router
from app.modules.notifications.router import router as notifications_router
from app.modules.nutrition_plans.router import router as nutrition_plans_router
from app.modules.payments.router import router as payments_router
from app.modules.pillars.router import router as pillars_router
from app.modules.programs.router import router as programs_router
from app.modules.recipes.router import router as recipes_router
from app.modules.scheduling.router import router as scheduling_router
from app.modules.users.router import router as users_router
from app.modules.wellness_tracking.router import router as wellness_router

api_v1_router = APIRouter()

# Mount all domain routers
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(pillars_router)
api_v1_router.include_router(recipes_router)
api_v1_router.include_router(meal_plans_router)
api_v1_router.include_router(live_classes_router)
api_v1_router.include_router(scheduling_router)
api_v1_router.include_router(commerce_router)
api_v1_router.include_router(programs_router)
api_v1_router.include_router(courses_router)
api_v1_router.include_router(memberships_router)
api_v1_router.include_router(payments_router)
api_v1_router.include_router(nutrition_plans_router)
api_v1_router.include_router(enquiries_router)
api_v1_router.include_router(leads_router)
api_v1_router.include_router(content_router)
api_v1_router.include_router(community_router)
api_v1_router.include_router(coaching_router)
api_v1_router.include_router(wellness_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(media_router)
api_v1_router.include_router(admin_router)
