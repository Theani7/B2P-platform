from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from datetime import datetime

from .models import Notification
from .preferences import NotificationPreference
from .schemas import NotificationCreate
from .models import NotificationType

class NotificationRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, obj_in: NotificationCreate) -> Notification:
        db_obj = Notification(
            recipient_id=obj_in.recipient_id,
            actor_id=obj_in.actor_id,
            type=obj_in.type,
            title=obj_in.title,
            message=obj_in.message,
            entity_type=obj_in.entity_type,
            entity_id=obj_in.entity_id,
            metadata=obj_in.metadata,
        )
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj

    def get_by_recipient(self, recipient_id: UUID, skip: int = 0, limit: int = 50, unread_only: bool = False) -> tuple[List[Notification], int]:
        query = self.session.query(Notification).filter(Notification.recipient_id == recipient_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
            
        total = query.count()
        items = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
        
        return items, total

    def get_unread_count(self, recipient_id: UUID) -> int:
        return (
            self.session.query(Notification)
            .filter(Notification.recipient_id == recipient_id, Notification.is_read == False)
            .count()
        )

    def mark_as_read(self, notification_id: UUID, recipient_id: UUID) -> Optional[Notification]:
        notification = (
            self.session.query(Notification)
            .filter(Notification.id == notification_id, Notification.recipient_id == recipient_id)
            .first()
        )
        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            self.session.commit()
            self.session.refresh(notification)
        return notification

    def mark_all_as_read(self, recipient_id: UUID) -> int:
        updated = (
            self.session.query(Notification)
            .filter(Notification.recipient_id == recipient_id, Notification.is_read == False)
            .update({"is_read": True, "read_at": datetime.utcnow()})
        )
        self.session.commit()
        return updated

    def delete(self, notification_id: UUID, recipient_id: UUID) -> bool:
        notification = (
            self.session.query(Notification)
            .filter(Notification.id == notification_id, Notification.recipient_id == recipient_id)
            .first()
        )
        if notification:
            self.session.delete(notification)
            self.session.commit()
            return True
        return False

    def get_preference(self, user_id: UUID, type: NotificationType) -> Optional[NotificationPreference]:
        return (
            self.session.query(NotificationPreference)
            .filter(NotificationPreference.user_id == user_id, NotificationPreference.type == type.value)
            .first()
        )
