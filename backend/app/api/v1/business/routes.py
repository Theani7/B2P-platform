"""Business profile routes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ...dependencies.auth import get_current_user, require_role
from ...core.role import Role
from ...schemas.business_profile import BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileRead
from ...services.business_profile import create_or_update, get_my_profile, delete_profile
from ...db.session import get_db

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