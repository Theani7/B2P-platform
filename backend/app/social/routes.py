"""Social link routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, RoleEnum
from app.social.schemas import SocialLinkCreate, SocialLinkUpdate, SocialLinkResponse, SocialLinkReorder
from app.social.service import SocialLinkService


router = APIRouter(prefix="/social", tags=["Social Links"])


@router.get("", response_model=List[SocialLinkResponse])
def get_my_social_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialLinkService(db)
    links = service.get_user_links(current_user.id)
    return links


@router.get("/me", response_model=List[SocialLinkResponse])
def get_my_social_links_alias(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialLinkService(db)
    links = service.get_user_links(current_user.id)
    return links


@router.get("/user/{user_id}", response_model=List[SocialLinkResponse])
def get_user_social_links(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    service = SocialLinkService(db)
    links = service.get_user_links(user_id)
    return links


@router.post("", response_model=SocialLinkResponse, status_code=status.HTTP_201_CREATED)
def create_social_link(
    schema: SocialLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=403, detail="Only PROMOTER users can create social links")
    service = SocialLinkService(db)
    link = service.create_link(current_user.id, schema)
    return link


@router.put("/{link_id}", response_model=SocialLinkResponse)
def update_social_link(
    link_id: UUID,
    schema: SocialLinkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialLinkService(db)
    link = service.update_link(current_user.id, link_id, schema)
    return link


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_social_link(
    link_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialLinkService(db)
    service.delete_link(current_user.id, link_id)
    return None


@router.put("/reorder")
def reorder_social_links(
    schema: SocialLinkReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # This route has to be before /{link_id} if it were generic, but reorder is a specific path
    service = SocialLinkService(db)
    result = service.reorder_links(current_user.id, schema.link_ids)
    return result
