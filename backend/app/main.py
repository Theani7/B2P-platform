from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.role import Role
from .exceptions.handlers import register_exception_handlers
from .middleware.security_headers import SecurityHeadersMiddleware
from .middleware.rate_limit import RateLimitMiddleware
from .api.v1.auth.routes import router as auth_router

app = FastAPI(title=settings.PROJECT_NAME)

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
# Simple per-IP rate limit for auth routes
app.add_middleware(RateLimitMiddleware, limit=5, window=60)

register_exception_handlers(app)

app.include_router(auth_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health():
    return {"status": "ok"}
