"""Permission and Role Evaluator Dependencies."""

from collections.abc import Callable

from app.core.exceptions import ForbiddenException, UnauthorizedException


class UserContext:
    def __init__(self, user_id: str, email: str, roles: list[str], permissions: list[str]):
        self.user_id = user_id
        self.email = email
        self.roles = roles
        self.permissions = set(permissions)

    def has_permission(self, permission: str) -> bool:
        # Super Administrator has wildcard access
        if "Super Administrator" in self.roles or "all" in self.permissions:
            return True
        return permission in self.permissions

    def has_role(self, role: str) -> bool:
        return role in self.roles


def require_permission(permission: str) -> Callable[[UserContext], UserContext]:
    def dependency(user: UserContext) -> UserContext:
        if not user:
            raise UnauthorizedException()
        if not user.has_permission(permission):
            raise ForbiddenException(
                f"Forbidden: You require the '{permission}' permission to perform this action."
            )
        return user

    return dependency


def require_roles(*allowed_roles: str) -> Callable[[UserContext], UserContext]:
    def dependency(user: UserContext) -> UserContext:
        if not user:
            raise UnauthorizedException()
        if "Super Administrator" in user.roles:
            return user
        if not any(role in user.roles for role in allowed_roles):
            raise ForbiddenException(
                f"Forbidden: Action restricted to roles: {', '.join(allowed_roles)}"
            )
        return user

    return dependency
