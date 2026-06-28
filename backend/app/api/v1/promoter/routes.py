"""Promoter profile routes."""
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import func
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....schemas.promoter_profile import (
    PromoterProfileCreate,
    PromoterProfileUpdate,
    PromoterProfileRead,
)
from ....schemas.discovery import PromoterDirectoryResponse, PromoterPublicProfileRead
from ....services.promoter_profile import (
    create_or_update,
    get_my_profile,
    delete_profile,
)
from ....services.discovery import search_promoters, get_public_profile
from ....db.session import get_db
from ....models.campaign_application import CampaignApplication
from ....models.collaboration import Collaboration, CollaborationStatus
from ....models.review import Review
from ....models.portfolio_item import PortfolioItem


router = APIRouter(prefix="/promoter", tags=["promoter"], dependencies=[Depends(require_role(Role.PROMOTER))])


@router.post("/profile", response_model=PromoterProfileRead, status_code=status.HTTP_201_CREATED)
def create_profile(payload: PromoterProfileCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_or_update(db, user, payload)


@router.get("/profile", response_model=PromoterProfileRead)
def read_profile(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_my_profile(db, user)


@router.put("/profile", response_model=PromoterProfileRead)
def update_profile(payload: PromoterProfileUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_or_update(db, user, payload)


@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile_endpoint(db: Session = Depends(get_db), user=Depends(get_current_user)):
    delete_profile(db, user)
    return None


@router.get("/analytics")
def promoter_analytics(db: Session = Depends(get_db), user=Depends(get_current_user)):
    profile = user.promoter_profile
    if not profile:
        return {
            "summary": {
                "profile_views": 0,
                "applications_submitted": 0,
                "accepted_applications": 0,
                "pending_applications": 0,
                "rejected_applications": 0,
                "invitations_received": 0,
                "invitations_accepted": 0,
                "invitations_pending": 0,
                "active_collaborations": 0,
                "completed_collaborations": 0,
                "average_rating": 0,
                "reviews_received": 0,
                "recommendation_percent": 0,
                "portfolio_items": 0,
                "profile_completion": 0,
            },
            "charts": {
                "monthly_applications": [],
                "monthly_collaborations": [],
                "monthly_reviews": [],
                "invitation_acceptance_trend": [],
                "application_success_trend": [],
                "rating_trend": [],
                "category_breakdown": [],
            },
            "growth": {
                "application_growth": 0,
                "collaboration_growth": 0,
            },
            "recent": {},
            "metadata": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "period": "30d",
            },
        }

    applications_submitted = db.query(CampaignApplication).filter(
        CampaignApplication.promoter_profile_id == profile.id
    ).count()

    pending_apps = db.query(CampaignApplication).filter(
        CampaignApplication.promoter_profile_id == profile.id,
        CampaignApplication.status == "PENDING"
    ).count()

    accepted_apps = db.query(CampaignApplication).filter(
        CampaignApplication.promoter_profile_id == profile.id,
        CampaignApplication.status == "ACCEPTED"
    ).count()

    rejected_apps = db.query(CampaignApplication).filter(
        CampaignApplication.promoter_profile_id == profile.id,
        CampaignApplication.status == "REJECTED"
    ).count()

    active_collabs = db.query(Collaboration).filter(
        Collaboration.promoter_profile_id == profile.id,
        Collaboration.status == CollaborationStatus.ACTIVE
    ).count()

    completed_collabs = db.query(Collaboration).filter(
        Collaboration.promoter_profile_id == profile.id,
        Collaboration.status == CollaborationStatus.COMPLETED
    ).count()

    reviews_received = db.query(Review).filter(Review.reviewee_id == user.id).count()
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.reviewee_id == user.id).scalar() or 0

    portfolio_items = db.query(PortfolioItem).filter(PortfolioItem.promoter_profile_id == profile.id).count()

    return {
        "summary": {
            "profile_views": 0,
            "applications_submitted": applications_submitted,
            "accepted_applications": accepted_apps,
            "pending_applications": pending_apps,
            "rejected_applications": rejected_apps,
            "invitations_received": 0,
            "invitations_accepted": 0,
            "invitations_pending": 0,
            "active_collaborations": active_collabs,
            "completed_collaborations": completed_collabs,
            "average_rating": round(float(avg_rating), 1) if avg_rating else 0.0,
            "reviews_received": reviews_received,
            "recommendation_percent": 0,
            "portfolio_items": portfolio_items,
            "profile_completion": 0,
        },
        "charts": {
            "monthly_applications": [],
            "monthly_collaborations": [],
            "monthly_reviews": [],
            "invitation_acceptance_trend": [],
            "application_success_trend": [],
            "rating_trend": [],
            "category_breakdown": [],
        },
        "growth": {
            "application_growth": 0,
            "collaboration_growth": 0,
        },
        "recent": {},
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "period": "30d",
        },
    }


# Public profile endpoint (no auth required)
public_router = APIRouter(prefix="/promoters", tags=["public-promoters"])


@public_router.get("/{username}", response_model=PromoterPublicProfileRead)
def public_profile(username: str, db: Session = Depends(get_db)):
    return get_public_profile(db, username)


# Directory endpoint (authenticated BUSINESS users)
directory_router = APIRouter(
    prefix="/promoters", tags=["promoter-directory"], dependencies=[Depends(require_role(Role.BUSINESS))]
)


@directory_router.get("", response_model=PromoterDirectoryResponse)
def promoter_directory(
    search: str = "",
    niche: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    verified: Optional[bool] = Query(None),
    followers_min: Optional[int] = Query(None),
    followers_max: Optional[int] = Query(None),
    experience_min: Optional[int] = Query(None),
    experience_max: Optional[int] = Query(None),
    sort_by: str = "newest",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = search_promoters(
        db,
        search=search,
        niche=niche,
        location=location,
        verified=verified,
        followers_min=followers_min,
        followers_max=followers_max,
        experience_min=experience_min,
        experience_max=experience_max,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )
    return PromoterDirectoryResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )