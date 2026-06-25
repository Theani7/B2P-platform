"""Social link repository."""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.social_link import SocialLink
from app.exceptions.custom import NotFoundError, ValidationError

class SocialLinkRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: UUID, data: dict) -> SocialLink:
        try:
            link = SocialLink(user_id=user_id, **data)
            self.db.add(link)
            self.db.commit()
            self.db.refresh(link)
            return link
        except IntegrityError:
            self.db.rollback()
            raise ValidationError("You have already linked this platform.")

    def get_by_id(self, link_id: UUID) -> Optional[SocialLink]:
        return self.db.query(SocialLink).filter(SocialLink.id == link_id).first()

    def get_user_links(self, user_id: UUID) -> List[SocialLink]:
        return self.db.query(SocialLink).filter(SocialLink.user_id == user_id).order_by(SocialLink.display_order.asc()).all()

    def update(self, link: SocialLink, data: dict) -> SocialLink:
        for key, value in data.items():
            setattr(link, key, value)
        self.db.commit()
        self.db.refresh(link)
        return link

    def delete(self, link: SocialLink) -> None:
        self.db.delete(link)
        self.db.commit()

    def reorder(self, user_id: UUID, link_ids: List[UUID]) -> None:
        links = self.get_user_links(user_id)
        link_dict = {link.id: link for link in links}
        
        for i, link_id in enumerate(link_ids):
            if link_id in link_dict:
                link_dict[link_id].display_order = i
                
        self.db.commit()
