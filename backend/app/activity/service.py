from sqlalchemy.orm import Session
from .repository import ActivityRepository
from .schemas import ActivityLogCreate
from uuid import UUID
from typing import Optional, Dict, Any
from ..models.activity_log import ActivityLog
from ..models.user import User
from ..core.role import Role

class ActivityService:
    @staticmethod
    def record(db: Session, action: str, title: str, actor_id: Optional[UUID]=None, actor_role: Optional[str]=None, entity_type: Optional[str]=None, entity_id: Optional[str]=None, description: Optional[str]=None, metadata_info: Optional[Dict[str, Any]]=None) -> ActivityLog:
        repo = ActivityRepository(db)
        data = ActivityLogCreate(
            actor_id=actor_id, 
            actor_role=actor_role, 
            entity_type=entity_type, 
            entity_id=str(entity_id) if entity_id else None, 
            action=action, 
            title=title, 
            description=description, 
            metadata_info=metadata_info
        )
        return repo.create(data)

    @staticmethod
    def get_my_activities(db: Session, user: User, page: int=1, size: int=20):
        repo = ActivityRepository(db)
        criteria = (ActivityLog.actor_id == user.id)
        items, total = repo.get_paginated(page, size, criteria)
        return items, total

    @staticmethod
    def get_business_activities(db: Session, user: User, page: int=1, size: int=20):
        repo = ActivityRepository(db)
        # Business can see activities they did, or activities on their entities
        criteria = (ActivityLog.actor_id == user.id)
        items, total = repo.get_paginated(page, size, criteria)
        return items, total

    @staticmethod
    def get_admin_activities(db: Session, page: int=1, size: int=20):
        repo = ActivityRepository(db)
        items, total = repo.get_paginated(page, size, None)
        return items, total
