"""Application Constants and System Roles/Permissions Catalogue."""

from enum import StrEnum


class RoleName(StrEnum):
    SUPER_ADMIN = "Super Administrator"
    ADMIN = "Administrator"
    COACH = "Coach"
    CONTENT_EDITOR = "Content Editor"
    COMMUNITY_MODERATOR = "Community Moderator"
    MEMBER = "Member"
    GUEST = "Guest"


class PermissionCode(StrEnum):
    # Users
    USERS_READ = "users.read"
    USERS_MANAGE = "users.manage"
    USERS_DELETE = "users.delete"

    # Roles & Permissions
    ROLES_MANAGE = "roles.manage"

    # Content & Articles
    CONTENT_READ = "content.read"
    CONTENT_MANAGE = "content.manage"

    # Programs
    PROGRAMS_READ = "programs.read"
    PROGRAMS_MANAGE = "programs.manage"

    # Memberships & Payments
    MEMBERSHIPS_READ = "memberships.read"
    MEMBERSHIPS_MANAGE = "memberships.manage"
    PAYMENTS_READ = "payments.read"
    PAYMENTS_MANAGE = "payments.manage"

    # Learning & Courses
    COURSES_READ = "courses.read"
    COURSES_MANAGE = "courses.manage"

    # Nutrition
    RECIPES_READ = "recipes.read"
    RECIPES_MANAGE = "recipes.manage"
    MEAL_PLANS_READ = "meal_plans.read"
    MEAL_PLANS_MANAGE = "meal_plans.manage"

    # Live Classes
    LIVE_CLASSES_READ = "live_classes.read"
    LIVE_CLASSES_BOOK = "live_classes.book"
    LIVE_CLASSES_MANAGE = "live_classes.manage"

    # Community
    COMMUNITY_READ = "community.read"
    COMMUNITY_POST = "community.post"
    COMMUNITY_MODERATE = "community.moderate"

    # Coaching
    COACHING_READ = "coaching.read"
    COACHING_MANAGE = "coaching.manage"

    # Wellness
    WELLNESS_READ = "wellness.read"
    WELLNESS_LOG = "wellness.log"

    # Admin & Platform
    LEADS_MANAGE = "leads.manage"
    REPORTS_READ = "reports.read"
    SETTINGS_MANAGE = "settings.manage"
    AUDIT_READ = "audit.read"


# Default Role to Permissions Mapping
DEFAULT_ROLE_PERMISSIONS: dict[str, list[str]] = {
    RoleName.SUPER_ADMIN: [perm.value for perm in PermissionCode],
    RoleName.ADMIN: [
        PermissionCode.USERS_READ,
        PermissionCode.USERS_MANAGE,
        PermissionCode.CONTENT_READ,
        PermissionCode.CONTENT_MANAGE,
        PermissionCode.PROGRAMS_READ,
        PermissionCode.PROGRAMS_MANAGE,
        PermissionCode.MEMBERSHIPS_READ,
        PermissionCode.MEMBERSHIPS_MANAGE,
        PermissionCode.PAYMENTS_READ,
        PermissionCode.COURSES_READ,
        PermissionCode.COURSES_MANAGE,
        PermissionCode.RECIPES_READ,
        PermissionCode.RECIPES_MANAGE,
        PermissionCode.MEAL_PLANS_READ,
        PermissionCode.MEAL_PLANS_MANAGE,
        PermissionCode.LIVE_CLASSES_READ,
        PermissionCode.LIVE_CLASSES_MANAGE,
        PermissionCode.COMMUNITY_READ,
        PermissionCode.COMMUNITY_MODERATE,
        PermissionCode.COACHING_READ,
        PermissionCode.COACHING_MANAGE,
        PermissionCode.LEADS_MANAGE,
        PermissionCode.REPORTS_READ,
        PermissionCode.SETTINGS_MANAGE,
        PermissionCode.AUDIT_READ,
    ],
    RoleName.COACH: [
        PermissionCode.USERS_READ,
        PermissionCode.CONTENT_READ,
        PermissionCode.PROGRAMS_READ,
        PermissionCode.COURSES_READ,
        PermissionCode.RECIPES_READ,
        PermissionCode.MEAL_PLANS_READ,
        PermissionCode.LIVE_CLASSES_READ,
        PermissionCode.LIVE_CLASSES_MANAGE,
        PermissionCode.COMMUNITY_READ,
        PermissionCode.COMMUNITY_POST,
        PermissionCode.COMMUNITY_MODERATE,
        PermissionCode.COACHING_READ,
        PermissionCode.COACHING_MANAGE,
        PermissionCode.WELLNESS_READ,
    ],
    RoleName.CONTENT_EDITOR: [
        PermissionCode.CONTENT_READ,
        PermissionCode.CONTENT_MANAGE,
        PermissionCode.RECIPES_READ,
        PermissionCode.RECIPES_MANAGE,
        PermissionCode.MEAL_PLANS_READ,
        PermissionCode.MEAL_PLANS_MANAGE,
        PermissionCode.COURSES_READ,
        PermissionCode.COURSES_MANAGE,
    ],
    RoleName.COMMUNITY_MODERATOR: [
        PermissionCode.COMMUNITY_READ,
        PermissionCode.COMMUNITY_POST,
        PermissionCode.COMMUNITY_MODERATE,
        PermissionCode.CONTENT_READ,
    ],
    RoleName.MEMBER: [
        PermissionCode.CONTENT_READ,
        PermissionCode.PROGRAMS_READ,
        PermissionCode.COURSES_READ,
        PermissionCode.RECIPES_READ,
        PermissionCode.MEAL_PLANS_READ,
        PermissionCode.LIVE_CLASSES_READ,
        PermissionCode.LIVE_CLASSES_BOOK,
        PermissionCode.COMMUNITY_READ,
        PermissionCode.COMMUNITY_POST,
        PermissionCode.WELLNESS_LOG,
        PermissionCode.WELLNESS_READ,
    ],
    RoleName.GUEST: [
        PermissionCode.CONTENT_READ,
        PermissionCode.RECIPES_READ,
    ],
}
