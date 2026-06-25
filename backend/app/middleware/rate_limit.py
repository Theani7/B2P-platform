"""Rate limiting middleware using slowapi concepts (lightweight)."""
from fastapi import Request
from fastapi.responses import JSONResponse
from time import time
from collections import defaultdict

_store: dict[str, list[float]] = defaultdict(list)


def reset_rate_limit_store() -> None:
    _store.clear()


AUTH_PREFIXES = ("/api/v1/auth/",)


class RateLimitMiddleware:
    def __init__(self, app, limit: int = 5, window: int = 60):
        self.app = app
        self.limit = limit
        self.window = window

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        request = Request(scope, receive)
        if not request.url.path.startswith(AUTH_PREFIXES):
            await self.app(scope, receive, send)
            return
        key = f"{request.client.host}:{request.url.path}"
        now = time()
        timestamps = [t for t in _store[key] if now - t < self.window]
        _store[key] = timestamps
        if len(timestamps) >= self.limit:
            response = JSONResponse(
                status_code=429,
                content={"success": False, "message": "Too many requests", "errors": []},
            )
            await response(scope, receive, send)
            return
        _store[key].append(now)
        await self.app(scope, receive, send)
