"""Global exception handlers.

Wrap every error into the standard envelope:
    { "success": false, "message": "...", "errors": [] }
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

from .app_error import AppError


def _error_response(message: str, status_code: int = 400, errors=None):
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "message": message, "errors": errors or []},
    )


async def app_error_handler(request: Request, exc: AppError):
    return _error_response(exc.message, exc.status_code, exc.details)


async def validation_error_handler(request: Request, exc: ValidationError):
    errors = [{"field": ".".join(str(loc) for loc in e["loc"]), "message": e["msg"]} for e in exc.errors()]
    return _error_response("Validation failed", status.HTTP_422_UNPROCESSABLE_ENTITY, errors)


async def integrity_error_handler(request: Request, exc: IntegrityError):
    return _error_response(
        "Database integrity error",
        status.HTTP_409_CONFLICT,
        [{"detail": str(exc.orig)}],
    )


async def generic_error_handler(request: Request, exc: Exception):
    return _error_response(
        "Internal server error",
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        [{"detail": str(exc)}],
    )


def register_exception_handlers(app):
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(ValidationError, validation_error_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(Exception, generic_error_handler)
