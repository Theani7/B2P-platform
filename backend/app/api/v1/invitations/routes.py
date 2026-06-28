"""Invitation routes."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....schemas.collaboration import (
    CampaignInvitationCreate,
    CampaignInvitationWithCampaignRead,
    CampaignInvitationListResponse,
    CollaborationRead,
)
from ....services.collaboration import (
    invite_promoter,
    cancel_invitation,
    get_business_invitations,
    get_promoter_invitations,
    accept_invitation,
    reject_invitation,
)
from ....db.session import get_db


# --- Business Invitation Routes ---

business_router = APIRouter(
    prefix="",
    tags=["business-invitations"],
    dependencies=[Depends(require_role(Role.BUSINESS))],
)


@business_router.post("/campaigns/{campaign_id}/invite/{promoter_id}", status_code=status.HTTP_201_CREATED)
def invite(
    campaign_id: str,
    promoter_id: str,
    payload: CampaignInvitationCreate = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if payload is None:
        payload = CampaignInvitationCreate()
    invitation = invite_promoter(db, user, campaign_id, promoter_id, payload)
    return {
        "success": True,
        "data": {
            "id": str(invitation.id),
            "status": invitation.status.value,
        },
    }


@business_router.delete("/invitations/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel(
    invitation_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    cancel_invitation(db, user, invitation_id)
    return None


@business_router.get("/business/invitations", response_model=CampaignInvitationListResponse)
def business_invitations(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_business_invitations(db, user, status=status, page=page, limit=limit)
    return CampaignInvitationListResponse(
        items=[item.model_dump() for item in items],
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


# --- Promoter Invitation Routes ---

promoter_router = APIRouter(
    prefix="",
    tags=["promoter-invitations"],
    dependencies=[Depends(require_role(Role.PROMOTER))],
)


@promoter_router.get("/promoter/invitations", response_model=CampaignInvitationListResponse)
def promoter_invitations(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_promoter_invitations(db, user, status=status, page=page, limit=limit)
    return CampaignInvitationListResponse(
        items=[item.model_dump() for item in items],
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


@promoter_router.post("/invitations/{invitation_id}/accept", status_code=status.HTTP_201_CREATED)
def accept(
    invitation_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    collab = accept_invitation(db, user, invitation_id)
    return {
        "success": True,
        "data": {
            "id": str(collab.id),
            "status": collab.status.value,
        },
    }


@promoter_router.post("/invitations/{invitation_id}/reject")
def reject(
    invitation_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    reject_invitation(db, user, invitation_id)
    return {"success": True, "message": "Invitation rejected"}