"""Collaboration management routes."""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path
import uuid
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....schemas.collaboration import CollaborationRead, CollaborationListResponse
from ....schemas.deliverable import DeliverableResponse, DeliverableCreate, DeliverableReview
from ....services.collaboration import get_business_collaborations, get_promoter_collaborations
from ....services.deliverable import (
    get_deliverables_by_collaboration,
    create_deliverable,
    review_deliverable
)
from ....db.session import get_db

# --- Business Collaboration Routes ---

business_router = APIRouter(
    prefix="/business/collaborations",
    tags=["business-collaborations"],
    dependencies=[Depends(require_role(Role.BUSINESS))],
)

@business_router.get("", response_model=CollaborationListResponse)
def business_collaborations(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_business_collaborations(db, user, status=status, page=page, limit=limit)
    return CollaborationListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )

@business_router.get("/{collaboration_id}/deliverables", response_model=List[DeliverableResponse])
def get_business_deliverables(
    collaboration_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # In a real app, verify the collaboration belongs to this business
    return get_deliverables_by_collaboration(db, collaboration_id)

@business_router.patch("/{collaboration_id}/deliverables/{deliverable_id}/review", response_model=DeliverableResponse)
def review_business_deliverable(
    data: DeliverableReview,
    collaboration_id: uuid.UUID = Path(...),
    deliverable_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Verify collaboration belongs to this business
    return review_deliverable(db, deliverable_id, data)

# --- Promoter Collaboration Routes ---

promoter_router = APIRouter(
    prefix="/promoter/collaborations",
    tags=["promoter-collaborations"],
    dependencies=[Depends(require_role(Role.PROMOTER))],
)

@promoter_router.get("", response_model=CollaborationListResponse)
def promoter_collaborations(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_promoter_collaborations(db, user, status=status, page=page, limit=limit)
    return CollaborationListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )

@promoter_router.get("/{collaboration_id}/deliverables", response_model=List[DeliverableResponse])
def get_promoter_deliverables(
    collaboration_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Verify collaboration belongs to this promoter
    return get_deliverables_by_collaboration(db, collaboration_id)

@promoter_router.post("/{collaboration_id}/deliverables", response_model=DeliverableResponse)
def submit_promoter_deliverable(
    data: DeliverableCreate,
    collaboration_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Verify collaboration belongs to this promoter
    return create_deliverable(db, collaboration_id, data)