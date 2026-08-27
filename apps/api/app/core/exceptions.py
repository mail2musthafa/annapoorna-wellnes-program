"""Application Domain Exceptions & Error Formats."""

from typing import Any

from fastapi import HTTPException, status


class DomainException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str = "DOMAIN_ERROR",
        extra: dict[str, Any] | None = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code
        self.extra = extra or {}


class BadRequestException(DomainException):
    def __init__(self, detail: str = "Bad request", code: str = "BAD_REQUEST", extra: dict[str, Any] | None = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            code=code,
            extra=extra,
        )


class NotFoundException(DomainException):
    def __init__(self, resource: str, identifier: Any = ""):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with identifier '{identifier}' was not found." if identifier else f"{resource} not found.",
            code="RESOURCE_NOT_FOUND",
            extra={"resource": resource, "identifier": str(identifier)},
        )


class ConflictException(DomainException):
    def __init__(self, detail: str, code: str = "RESOURCE_CONFLICT", extra: dict[str, Any] | None = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            code=code,
            extra=extra,
        )


class UnauthorizedException(DomainException):
    def __init__(self, detail: str = "Authentication required or invalid credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="UNAUTHORIZED",
        )


class ForbiddenException(DomainException):
    def __init__(self, detail: str = "You do not have permission to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="FORBIDDEN",
        )


class ValidationException(DomainException):
    def __init__(self, detail: str, errors: list[dict[str, Any]] | None = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            code="VALIDATION_FAILED",
            extra={"errors": errors or []},
        )
