"""Collaboration management routes."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....schemas.collaboration import CollaborationRead, CollaborationListResponse
from ....services.collaboration import get_business_collaborations, get_promoter_collaborations
from ....db.session import get_db


# --- Business Collaboration Routes ---

business_router = APIRouter(
    prefix="/business/collaborations",
    tags=["business-collaborations"],
    dependencies=[Depends(require_role(Role.BUSINESS))],
)


@business_router.get("", response_model=CollaborationListResponse)
def business_collaborations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_business_collaborations(db, user, page=page, limit=limit)
    return CollaborationListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


# --- Promoter Collaboration Routes ---

promoter_router = APIRouter(
    prefix="/promoter/collaborations",
    tags=["promoter-collaborations"],
    dependencies=[Depends(require_role(Role.PROMOTER))],
)


@promoter_router.get("", response_model=CollaborationListResponse)
def promoter_collaborations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_promoter_collaborations(db, user, page=page, limit=limit)
    return CollaborationListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )
