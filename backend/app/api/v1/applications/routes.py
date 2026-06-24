"""Application routes."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....schemas.collaboration import (
    CampaignApplicationCreate,
    CampaignApplicationWithCampaignRead,
    CampaignApplicationWithPromoterRead,
    CampaignApplicationListResponse,
    CollaborationRead,
)
from ....services.collaboration import (
    apply_to_campaign,
    withdraw_application,
    get_promoter_applications,
    get_campaign_applications,
    accept_application,
    reject_application,
)
from ....db.session import get_db


# --- Promoter Application Routes ---

promoter_router = APIRouter(
    prefix="",
    tags=["promoter-applications"],
    dependencies=[Depends(require_role(Role.PROMOTER))],
)


@promoter_router.post("/campaigns/{campaign_id}/apply", status_code=status.HTTP_201_CREATED)
def apply(
    campaign_id: str,
    payload: CampaignApplicationCreate = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if payload is None:
        payload = CampaignApplicationCreate()
    application = apply_to_campaign(db, user, campaign_id, payload)
    return {
        "success": True,
        "data": {
            "id": str(application.id),
            "campaign_id": str(application.campaign_id),
            "status": application.status.value,
        },
    }


@promoter_router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw(
    application_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    withdraw_application(db, user, application_id)
    return None


@promoter_router.get("/promoter/applications", response_model=CampaignApplicationListResponse)
def my_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_promoter_applications(db, user, page=page, limit=limit)
    return CampaignApplicationListResponse(
        items=[item.model_dump() for item in items],
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


# --- Business Application Review Routes ---

business_router = APIRouter(
    prefix="",
    tags=["business-applications"],
    dependencies=[Depends(require_role(Role.BUSINESS))],
)


@business_router.get("/campaigns/{campaign_id}/applications", response_model=CampaignApplicationListResponse)
def campaign_applications(
    campaign_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_campaign_applications(db, user, campaign_id, page=page, limit=limit)
    return CampaignApplicationListResponse(
        items=[item.model_dump() for item in items],
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


@business_router.post("/applications/{application_id}/accept", status_code=status.HTTP_201_CREATED)
def accept(
    application_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    collab = accept_application(db, user, application_id)
    return {
        "success": True,
        "data": {
            "id": str(collab.id),
            "status": collab.status.value,
        },
    }


@business_router.post("/applications/{application_id}/reject")
def reject(
    application_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    reject_application(db, user, application_id)
    return {"success": True, "message": "Application rejected"}
