from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.role import Role
from .exceptions.handlers import register_exception_handlers
from .middleware.security_headers import SecurityHeadersMiddleware
from .middleware.rate_limit import RateLimitMiddleware
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
app.add_middleware(RateLimitMiddleware, limit=settings.RATE_LIMIT_AUTH, window=60)

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


@app.get("/health")
def health():
    return {"status": "ok"}