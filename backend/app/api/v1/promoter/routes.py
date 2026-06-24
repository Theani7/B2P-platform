"""Promoter profile routes."""
from typing import Optional

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