"""Promoter profile routes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from ...dependencies.auth import get_current_user, require_role
from ...core.role import Role
from ...schemas.promoter_profile import (
    PromoterProfileCreate,
    PromoterProfileUpdate,
    PromoterProfileRead,
)
from ...services.promoter_profile import (
    create_or_update,
    get_my_profile,
    delete_profile,
    get_public_profile,
    search_public_profiles,
)
from ...db.session import get_db

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


@public_router.get("/{username}", response_model=PromoterProfileRead)
def public_profile(username: str, db: Session = Depends(get_db)):
    return get_public_profile(db, username)


# Directory endpoint (authenticated BUSINESS users)
directory_router = APIRouter(prefix="/directory", tags=["directory"], dependencies=[Depends(require_role(Role.BUSINESS))])


@directory_router.get("/promoters", response_model=List[PromoterProfileRead])
def promoter_directory(search: str = "", skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return search_public_profiles(db, search, skip, limit)