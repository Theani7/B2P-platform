from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
import math

from app.db.session import get_db
from app.core.security import get_current_user
from app.core.role import RoleEnum, require_role
from app.models.user import User
from app.activity.service import ActivityService
from app.activity.schemas import PaginatedActivityResponse

router = APIRouter()

@router.get("/me", response_model=PaginatedActivityResponse)
def get_my_activities(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items, total = ActivityService.get_my_activities(db, user=current_user, page=page, size=size)
    pages = math.ceil(total / size) if total > 0 else 1
    return {"items": items, "total": total, "page": page, "size": size, "pages": pages}

@router.get("/business", response_model=PaginatedActivityResponse)
def get_business_activities(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleEnum.BUSINESS))):
    items, total = ActivityService.get_business_activities(db, user=current_user, page=page, size=size)
    pages = math.ceil(total / size) if total > 0 else 1
    return {"items": items, "total": total, "page": page, "size": size, "pages": pages}

@router.get("/admin", response_model=PaginatedActivityResponse)
def get_admin_activities(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleEnum.ADMIN))):
    items, total = ActivityService.get_admin_activities(db, page=page, size=size)
    pages = math.ceil(total / size) if total > 0 else 1
    return {"items": items, "total": total, "page": page, "size": size, "pages": pages}
