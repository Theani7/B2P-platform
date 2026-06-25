import logging
import sys
from time import time
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from .core.config import settings
from .core.role import Role
from .exceptions.handlers import register_exception_handlers
from .middleware.security_headers import SecurityHeadersMiddleware
from .middleware.rate_limit import RateLimitMiddleware
from .db.session import get_db
from .api.v1.auth.routes import router as auth_router
from .api.v1.business.routes import router as business_router
from .api.v1.promoter.routes import router as promoter_router, public_router, directory_router
from .api.v1.portfolio.routes import router as portfolio_router
from .api.v1.social_links.routes import router as social_links_router
from .api.v1.upload.routes import router as upload_router
from .api.v1.campaign.routes import router as campaign_router
from .api.v1.marketplace.routes import router as marketplace_router
from .api.v1.applications.routes import promoter_router as promoter_app_router
from .api.v1.applications.routes import business_router as business_app_router
from .api.v1.invitations.routes import business_router as business_invitation_router
from .api.v1.invitations.routes import promoter_router as promoter_invitation_router
from .api.v1.collaborations.routes import business_router as business_collab_router
from .api.v1.collaborations.routes import promoter_router as promoter_collab_router
from .api.v1.matching.routes import router as matching_router
from .api.v1.reviews.routes import router as review_router
from .api.v1.admin.routes import router as admin_router
from .api.v1.promoter_verification.routes import router as promoter_verification_router
from .api.v1.activity.routes import router as activity_router
from .api.v1.profile_completion.routes import router as profile_completion_router
from .api.v1.profile_completion.routes import router as profile_completion_router
from .portfolio.routes import router as portfolio_router
from .social.routes import router as social_router
from .chat.routes import router as chat_router

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    stream=sys.stdout,
)
logger = logging.getLogger("b2p")

app = FastAPI(title=settings.PROJECT_NAME)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time()
    response = await call_next(request)
    elapsed = time() - start
    logger.info(
        "%s %s → %d (%.2fms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed * 1000,
    )
    return response

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, limit=settings.RATE_LIMIT_AUTH, window=60)

app.mount("/static", StaticFiles(directory="uploads"), name="static")

register_exception_handlers(app)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(business_router, prefix=settings.API_V1_STR)
app.include_router(promoter_router, prefix=settings.API_V1_STR)
app.include_router(public_router, prefix=settings.API_V1_STR)
app.include_router(directory_router, prefix=settings.API_V1_STR)
app.include_router(portfolio_router, prefix=settings.API_V1_STR)
app.include_router(social_links_router, prefix=settings.API_V1_STR)
app.include_router(upload_router, prefix=settings.API_V1_STR)
app.include_router(campaign_router, prefix=settings.API_V1_STR)
app.include_router(marketplace_router, prefix=settings.API_V1_STR)
app.include_router(promoter_app_router, prefix=settings.API_V1_STR)
app.include_router(business_app_router, prefix=settings.API_V1_STR)
app.include_router(business_invitation_router, prefix=settings.API_V1_STR)
app.include_router(promoter_invitation_router, prefix=settings.API_V1_STR)
app.include_router(business_collab_router, prefix=settings.API_V1_STR)
app.include_router(promoter_collab_router, prefix=settings.API_V1_STR)
app.include_router(matching_router, prefix=settings.API_V1_STR)
app.include_router(review_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(promoter_verification_router, prefix=settings.API_V1_STR)
app.include_router(activity_router, prefix=f"{settings.API_V1_STR}/activity", tags=["activity"])
app.include_router(profile_completion_router, prefix=f"{settings.API_V1_STR}/profile-completion", tags=["profile-completion"])
app.include_router(portfolio_router, prefix=f"{settings.API_V1_STR}/portfolio", tags=["portfolio"])
app.include_router(social_router, prefix=f"{settings.API_V1_STR}")
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"
    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not ready", "database": "disconnected"},
        )


@app.get("/version")
def version():
    return {
        "name": "Byparsathy",
        "version": "1.0.0",
        "api_version": "v1",
        "environment": "production",
    }