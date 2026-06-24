"""Social links routes for promoters."""
import uuid
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ...dependencies.auth import get_current_user, require_role
from ...core.role import Role
from ...schemas.social_link import SocialLinkCreate, SocialLinkUpdate, SocialLinkRead
from ...services.social_links import create_link, get_my_links, update_link, delete_link
from ...db.session import get_db

router = APIRouter(prefix="/social-links", tags=["social-links"], dependencies=[Depends(require_role(Role.PROMOTER))])


@router.post("/", response_model=SocialLinkRead, status_code=status.HTTP_201_CREATED)
def add_social_link(payload: SocialLinkCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_link(db, user, payload)


@router.get("/", response_model=List[SocialLinkRead])
def list_social_links(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_my_links(db, user)


@router.put("/{link_id}", response_model=SocialLinkRead)
def update_social_link(link_id: uuid.UUID, payload: SocialLinkUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return update_link(db, user, link_id, payload)


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_social_link(link_id: uuid.UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    delete_link(db, user, link_id)
    return None