from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..models.activity_log import ActivityLog
from ..models.user import User
from .schemas import ActivityLogCreate
from uuid import UUID
from typing import Tuple, List

class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def create(self, data: ActivityLogCreate) -> ActivityLog:
        obj = ActivityLog(**data.model_dump())
        self.db.add(obj)
        self.db.flush()
        return obj

    def get_paginated(self, page: int, size: int, filter_criteria=None) -> Tuple[List[dict], int]:
        query = self.db.query(ActivityLog, User).outerjoin(User, ActivityLog.actor_id == User.id)
        
        if filter_criteria is not None:
            query = query.filter(filter_criteria)
            
        total = query.count()
        items = query.order_by(desc(ActivityLog.created_at)).offset((page - 1) * size).limit(size).all()
        
        # Format the response with actor_name attached
        results = []
        for log, user in items:
            log_dict = {
                "id": log.id,
                "actor_id": log.actor_id,
                "actor_role": log.actor_role,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "action": log.action,
                "title": log.title,
                "description": log.description,
                "metadata_info": log.metadata_info,
                "created_at": log.created_at,
                "actor_name": user.full_name if user else None,
                "actor_avatar": None # Not implemented in user model yet
            }
            results.append(log_dict)
            
        return results, total
