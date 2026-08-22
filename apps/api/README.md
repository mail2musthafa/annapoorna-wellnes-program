# Annapoorna Portal API

Modular Monolith backend for the Annapoorna Lifestyle & Wellness platform.

## Architecture

Built using FastAPI, SQLAlchemy 2.0 Async, PostgreSQL 16, Redis 7, Celery, and Pydantic v2.

### Domain Modules
- `auth`: JWT Authentication & Session lifecycle
- `users`: User profiles, preferences, GDPR data management
- `roles`: Dynamic RBAC role and permission matrix
- `pillars`: The Six Lifestyle Pillars (Nutrition, Movement, Restorative Sleep, Mindfulness, Relationships, Avoidance of Risky Substances)
- `recipes`: Structured culinary medicine recipes & tags
- `meal_plans`: 6-week progressive meal planning system
- `live_classes`: Scheduled live workshops & idempotent bookings
- `programs`: Multi-week wellness cohorts & enrolments
- `courses`: Structured learning modules & lesson tracking
- `memberships`: Subscriptions & entitlements
- `payments`: Checkout sessions & idempotent webhooks
- `leads`: Lead generation & discovery call scheduling
- `content`: Medically-reviewed educational articles
- `community`: Moderated spaces, feeds & posts
- `coaching`: Coach assignments & private coach notes
- `wellness_tracking`: Non-diagnostic wellness reflections
- `notifications`: Multi-channel notification delivery
- `media`: Object storage and asset management
- `audit`: Administrative & security audit logging
- `admin`: Operational metric summaries

## Commands

```bash
# Run tests
pytest tests -v

# Run database seeder
python -m scripts.seed

# Run dev server
uvicorn app.main:app --reload --port 8000
```
