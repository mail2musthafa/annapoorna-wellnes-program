# Database Schema Design & Entity Relationship Plan

## 1. Design Conventions
- **Primary Keys**: UUID v4 across all tables (`id: Uuid(as_uuid=True)`).
- **Audit Columns**: `created_at` and `updated_at` timezone-aware UTC timestamps on every table.
- **Constraints**: Explicit unique constraints on idempotent fields (e.g., `uq_live_class_user_booking`, `uq_provider_event_id`, `uq_user_daily_checkin`).
- **Soft Deletion**: Applied via `is_deleted` and `deleted_at` only on entities requiring business-level historical auditing (`users`, `recipes`, `courses`, `programs`, `live_classes`).

---

## 2. Table Domains & Relationships

### Identity & Access
- `users`: User authentication credentials, verification state, and active status.
- `user_profiles`: First name, last name, phone, bio, avatar URL, and timezone preferences.
- `roles`: System roles (`Super Administrator`, `Administrator`, `Coach`, `Content Editor`, `Community Moderator`, `Member`, `Guest`).
- `permissions`: Fine-grained permission codes (e.g., `users.read`, `live_classes.book`, `recipes.manage`).
- `user_roles`: Many-to-many link between users and roles.
- `role_permissions`: Many-to-many link between roles and permissions.
- `user_sessions`: Refresh token rotation tracking, client IP, and device user-agents.
- `consent_records`: GDPR/consent auditing with timestamp, consent type, and version.

### Marketing & Leads
- `leads`: Email, attribution campaign, marketing consent, and qualification lifecycle.
- `lead_magnets`: Downloadable starter guides and resources.
- `lead_magnet_downloads`: Download history linked to leads.
- `discovery_call_requests`: Booking requests for consultation calls.

### Commercial & Subscriptions
- `membership_plans`: Monthly and annual tier pricing models.
- `subscriptions`: Active subscription records with start and renewal dates.
- `payments`: Transaction records with payment type and status.
- `payment_webhook_events`: Idempotent webhook event ledger.
- `coupons`: Promotional discount rules and redemption limits.
- `entitlements`: Access grants for programs, courses, or community areas.

### Lifestyle Pillars & Nutrition
- `pillars`: The Six Lifestyle Pillars with educational, management, and analysis summaries.
- `pillar_goals`: Suggested daily/weekly goals.
- `metric_definitions`: Measurable lifestyle indicators.
- `recipes`: Culinary medicine recipes with macros, prep time, cook time, and instructions.
- `ingredients` & `recipe_ingredients`: Structured ingredient quantities and allergen flags.
- `meal_plans`, `meal_plan_weeks`, `meal_plan_days`, `meal_slots`: 6-week progressive meal planning schedules.

### Live Experiences & Coaching
- `live_classes`: Scheduled interactive classes, capacity limits, and instructor assignments.
- `live_class_bookings`: Member bookings with duplicate prevention constraints.
- `coach_profiles`, `coach_assignments`, `appointments`: Coaching sessions.
- `coach_notes`: Strictly private notes isolated from member queries.

### Community & Platform
- `community_spaces`: Topic channels and discussion spaces.
- `posts`, `comments`, `reactions`: Community feed items and interactions.
- `content_reports` & `moderation_actions`: Audit logs for content moderation.
- `notifications` & `notification_preferences`: Alert outbox and delivery settings.
- `media_assets`: Uploaded media files with storage keys and dimensions.
- `audit_logs`: Immutable security and administrative change logs.
