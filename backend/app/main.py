"""FastAPI application entry point.

Includes the version‑1 auth router under the configured prefix.
"""
from fastapi import FastAPI

from .core.config import settings
from .api.v1.auth.routes import router as auth_router

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth_router, prefix=settings.API_V1_STR)
