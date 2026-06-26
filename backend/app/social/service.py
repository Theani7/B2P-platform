"""Social link service."""
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.social.schemas import SocialLinkCreate, SocialLinkUpdate
from app.social.repository import SocialLinkRepository
from app.social.validators import validate_platform_url
from app.exceptions.app_error import AppError

class SocialLinkService:
    def __init__(self, db: Session):
        self.repo = SocialLinkRepository(db)

    def create_link(self, user_id: UUID, schema: SocialLinkCreate):
        validate_platform_url(schema.platform, str(schema.url))
        return self.repo.create(user_id, schema.model_dump())

    def get_user_links(self, user_id: UUID):
        return self.repo.get_user_links(user_id)

    def update_link(self, user_id: UUID, link_id: UUID, schema: SocialLinkUpdate):
        link = self.repo.get_by_id(link_id)
        if not link:
            raise AppError("Social link not found", status_code=404)
        if link.user_id != user_id:
            raise AppError("You can only modify your own social links", status_code=403)
        
        update_data = schema.model_dump(exclude_unset=True)
        if "url" in update_data:
            validate_platform_url(link.platform, str(update_data["url"]))
            
        return self.repo.update(link, update_data)

    def delete_link(self, user_id: UUID, link_id: UUID):
        link = self.repo.get_by_id(link_id)
        if not link:
            raise AppError("Social link not found", status_code=404)
        if link.user_id != user_id:
            raise AppError("You can only delete your own social links", status_code=403)
            
        self.repo.delete(link)
        return {"success": True, "message": "Social link deleted successfully"}

    def reorder_links(self, user_id: UUID, link_ids: List[UUID]):
        self.repo.reorder(user_id, link_ids)
        return {"success": True, "message": "Social links reordered successfully"}
