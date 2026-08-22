"""Standard Pagination Models and Query Parameters."""

from collections.abc import Sequence
from typing import TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PageParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number starting at 1")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page (max 100)")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PageResponse[T](BaseModel):
    items: Sequence[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

    @classmethod
    def create(cls, items: Sequence[T], total: int, params: PageParams) -> "PageResponse[T]":
        total_pages = (total + params.page_size - 1) // params.page_size if total > 0 else 1
        return cls(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages,
            has_next=params.page < total_pages,
            has_prev=params.page > 1,
        )
