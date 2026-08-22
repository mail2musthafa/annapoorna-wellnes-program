"""FastAPI Middleware: Request ID, Structured Logging, Exception Handling."""

import logging
import time
import uuid

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger("annapoorna.http")


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"

        # Log request summary without sensitive details
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({process_time * 1000:.2f}ms)",
            extra={"request_id": request_id},
        )
        return response
