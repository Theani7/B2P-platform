"""Business profile routes + shortlist (saved promoters)."""
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....schemas.business_profile import BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileRead
from ....schemas.discovery import SavedPromoterRead, PromoterDirectoryResponse
from ....services.business_profile import create_or_update, get_my_profile, delete_profile
from ....services.discovery import save_promoter, remove_saved_promoter, get_saved_promoters
from ....db.session import get_db

router = APIRouter(prefix="/business", tags=["business"], dependencies=[Depends(require_role(Role.BUSINESS))])


@router.post("/profile", response_model=BusinessProfileRead, status_code=status.HTTP_201_CREATED)
def create_profile(payload: BusinessProfileCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_or_update(db, user, payload)


@router.get("/profile", response_model=BusinessProfileRead)
def read_profile(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_my_profile(db, user)


@router.put("/profile", response_model=BusinessProfileRead)
def update_profile(payload: BusinessProfileUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_or_update(db, user, payload)


@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile_endpoint(db: Session = Depends(get_db), user=Depends(get_current_user)):
    delete_profile(db, user)
    return None


# --- Saved Promoters (Shortlist) ---


@router.post("/saved-promoters/{promoter_id}", status_code=status.HTTP_201_CREATED)
def add_saved_promoter(promoter_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    saved = save_promoter(db, user, promoter_id)
    return {"success": True, "data": {"id": str(saved.id)}}


@router.delete("/saved-promoters/{promoter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_promoter(promoter_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    remove_saved_promoter(db, user, promoter_id)
    return None


@router.get("/saved-promoters", response_model=PromoterDirectoryResponse)
def list_saved_promoters(
    search: str = "",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_saved_promoters(db, user, search=search, page=page, limit=limit)
    return PromoterDirectoryResponse(
        items=[s.promoter_profile for s in items],
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


@router.get("/analytics")
def business_analytics(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return {
        "summary": {
            "active_campaigns": 0,
            "total_spent": 0,
            "applications_received": 0,
            "collaborations_completed": 0,
            "average_roi": 0,
            "profile_views": 0,
            "average_rating": 0,
        },
        "charts": {},
        "growth": {},
        "metadata": {"period": "30d"}
    }