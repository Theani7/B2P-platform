"""Rate limiting middleware using slowapi concepts (lightweight)."""
from fastapi import Request
from fastapi.responses import JSONResponse
from time import time
from collections import defaultdict

_store: dict[str, list[float]] = defaultdict(list)


def reset_rate_limit_store() -> None:
    _store.clear()


# Auth endpoints - strict limits (5 req/min)
AUTH_PREFIXES = ("/api/v1/auth/",)

# Write endpoints - moderate limits (30 req/min)
WRITE_PREFIXES = (
    "/api/v1/campaigns",
    "/api/v1/applications",
    "/api/v1/invitations",
    "/api/v1/reviews",
    "/api/v1/upload",
    "/api/v1/promoter/profile",
    "/api/v1/business/profile",
    "/api/v1/social",
    "/api/v1/portfolio",
    "/api/v1/chat",
    "/api/v1/admin",
)


def _is_write_endpoint(path: str) -> bool:
    """Check if path is a write endpoint that should be rate limited."""
    if path.startswith(AUTH_PREFIXES):
        return True
    for prefix in WRITE_PREFIXES:
        if path.startswith(prefix):
            # Only rate limit write methods (POST, PUT, PATCH, DELETE)
            return True
    return False


class RateLimitMiddleware:
    def __init__(self, app, limit: int = 5, window: int = 60):
        self.app = app
        self.limit = limit
        self.window = window
        self.write_limit = 30  # Higher limit for write endpoints
        self.write_window = 60

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        request = Request(scope, receive)
        
        # Determine rate limit based on endpoint type
        is_auth = request.url.path.startswith(AUTH_PREFIXES)
        is_write = False
        for prefix in WRITE_PREFIXES:
            if request.url.path.startswith(prefix):
                is_write = True
                break
        
        if not is_auth and not is_write:
            await self.app(scope, receive, send)
            return
        
        # Skip rate limiting for read methods on write endpoints
        if is_write and request.method in ("GET", "HEAD", "OPTIONS"):
            await self.app(scope, receive, send)
            return
            
        key = f"{request.client.host}:{request.url.path}"
        now = time()
        
        if is_auth:
            limit = self.limit
            window = self.window
        else:
            limit = self.write_limit
            window = self.write_window
            
        timestamps = [t for t in _store[key] if now - t < window]
        _store[key] = timestamps
        if len(timestamps) >= limit:
            response = JSONResponse(
                status_code=429,
                content={"success": False, "message": "Too many requests", "errors": []},
            )
            await response(scope, receive, send)
            return
        _store[key].append(now)
        await self.app(scope, receive, send)
