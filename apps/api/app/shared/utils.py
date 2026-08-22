"""Shared helper utilities."""

import re
import unicodedata
from datetime import UTC, datetime


def utc_now() -> datetime:
    """Return current timezone-aware UTC datetime."""
    return datetime.now(UTC)


def slugify(text: str) -> str:
    """Generate a clean URL slug from any input string."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text)
