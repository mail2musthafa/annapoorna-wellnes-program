# API Route Map & Resource Architecture

All endpoints are served under the versioned prefix `/api/v1/`.

## 1. Public & Marketing Endpoints
- `GET /health` - Service liveness probe
- `GET /ready` - Database readiness probe
- `POST /api/v1/auth/register` - Register a new member account
- `POST /api/v1/auth/login` - Authenticate and receive JWT access/refresh tokens
- `POST /api/v1/auth/refresh` - Refresh an expired access token
- `POST /api/v1/leads/capture` - Lead capture & free guide delivery
- `POST /api/v1/leads/discovery-call` - Request a discovery consultation
- `GET /api/v1/pillars` - List all 6 lifestyle pillars from the database
- `GET /api/v1/pillars/{slug}` - Get specific pillar details with goals & metrics
- `GET /api/v1/recipes` - Paginated public recipe catalogue with search & tag filters
- `GET /api/v1/recipes/{slug}` - Detailed recipe view with ingredients and method
- `GET /api/v1/programs` - List published lifestyle programs
- `GET /api/v1/courses` - List published courses & syllabus
- `GET /api/v1/meal-plans` - List active meal plans
- `GET /api/v1/memberships/plans` - List available membership tiers
- `GET /api/v1/content/articles` - List educational wellness articles with medical review status
- `GET /api/v1/coaching/coaches` - List certified holistic health coaches

## 2. Protected Member Endpoints (Requires `Bearer <JWT>`)
- `GET /api/v1/users/me` - Get authenticated user profile & permissions
- `GET /api/v1/users/me/dashboard` - Get member dashboard summary (programs, classes, meal plan)
- `GET /api/v1/live-classes` - List scheduled live classes with member booking status
- `POST /api/v1/live-classes/{class_id}/book` - Book live class (enforces capacity & duplicate prevention)
- `POST /api/v1/wellness/check-in` - Record daily wellness check-in (non-diagnostic)
- `GET /api/v1/community/spaces` - List accessible community channels
- `POST /api/v1/community/posts` - Publish a new community post
- `GET /api/v1/notifications` - Get member notification feed
- `POST /api/v1/payments/checkout` - Create checkout session for program/membership
- `POST /api/v1/media/upload` - Securely upload user avatar or media asset

## 3. Operations & Administrative Endpoints (Requires `Admin` / `Super Administrator`)
- `GET /api/v1/admin/metrics` - High-level operational platform metrics (users, subs, classes, leads)
- `POST /api/v1/payments/webhook/{provider}` - Idempotent signed payment webhook processor
