# Authentication, Security & RBAC Model

## 1. Authentication Strategy

### Password Hashing
- **Argon2** is utilized as the primary password hashing scheme (`argon2-cffi`) with bcrypt fallback support.
- Passwords are never stored in plaintext or logged to application standard output.

### JWT Token Lifecycles
- **Access Tokens**: Signed with HMAC-SHA256 (`HS256`), containing `sub` (User UUID), `roles`, `permissions`, and expiration timestamp (`exp`).
- **Refresh Tokens**: Long-lived single-use tokens tracked in `user_sessions` for revocation upon password change, logout, or anomaly detection.

---

## 2. Role-Based Access Control (RBAC)

FastAPI dependencies enforce permissions declaratively at the route level:

```python
@router.post("/live-classes/{class_id}/book")
async def book_live_class(
    class_id: str,
    user_context: UserContext = Depends(get_current_user_context),
):
    require_permission(PermissionCode.LIVE_CLASSES_BOOK)(user_context)
    ...
```

### Initial Roles Matrix
- **Super Administrator**: Wildcard access to all system functions.
- **Administrator**: User management, content editing, live class scheduling, payment audit, reports.
- **Coach**: Member tracking, live class management, community moderation, private notes.
- **Content Editor**: Article publishing, recipe curation, meal-plan structuring.
- **Community Moderator**: Post/comment moderation, report handling.
- **Member**: Program viewing, course lesson progress, live class booking, community posting, wellness logging.
- **Guest**: Public recipe catalogue, 6-pillar overviews, lead magnet downloads.

---

## 3. Privacy & Non-Diagnostic Wellness Safeguards
- **Coaching Notes Privacy**: `coach_notes` are strictly isolated to assigned coaches and supervisors, never appearing in member or community endpoints.
- **Non-Diagnostic Nature**: All wellness tracking entries are explicitly labeled as personal self-reflections and not clinical diagnosis or medical recommendations.
- **GDPR Audit**: `consent_records` captures explicit consent versions and timestamps.
