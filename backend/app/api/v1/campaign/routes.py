"""Campaign management routes."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....schemas.campaign import CampaignCreate, CampaignUpdate, CampaignRead, CampaignListRead
from ....services.campaign import (
    create_campaign,
    get_campaign,
    list_campaigns,
    update_campaign,
    delete_campaign,
    archive_campaign,
    reopen_campaign,
    get_dashboard_stats,
)
from ....db.session import get_db

router = APIRouter(
    prefix="/campaigns",
    tags=["campaigns"],
    dependencies=[Depends(require_role(Role.BUSINESS))],
)


@router.post("", response_model=CampaignRead, status_code=status.HTTP_201_CREATED)
def create(payload: CampaignCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_campaign(db, user, payload)


@router.get("", response_model=CampaignListRead)
def list_all(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort: str = Query("created_at"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = list_campaigns(db, user, search=search, page=page, limit=limit, sort=sort)
    return CampaignListRead(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_dashboard_stats(db, user)


@router.get("/{campaign_id}", response_model=CampaignRead)
def get(campaign_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_campaign(db, user, campaign_id)


@router.put("/{campaign_id}", response_model=CampaignRead)
def update(campaign_id: str, payload: CampaignUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return update_campaign(db, user, campaign_id, payload)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(campaign_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    delete_campaign(db, user, campaign_id)
    return None


@router.post("/{campaign_id}/archive", response_model=CampaignRead)
def archive(campaign_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return archive_campaign(db, user, campaign_id)


@router.post("/{campaign_id}/reopen", response_model=CampaignRead)
def reopen(campaign_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return reopen_campaign(db, user, campaign_id)
