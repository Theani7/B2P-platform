from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from .repository import NotificationRepository
from .schemas import NotificationCreate, NotificationResponse
from .connection_manager import manager
from .models import NotificationType
from .preferences import NotificationPreference

class NotificationService:
    def __init__(self, session: Session):
        self.repository = NotificationRepository(session)

    def is_notification_enabled(self, user_id: UUID, type: NotificationType) -> bool:
        pref = self.repository.get_preference(user_id, type)
        return pref.enabled if pref else True

    def seed_preferences(self, user_id: UUID) -> None:
        from app.notifications.models import NotificationType as NT
        existing_types = {
            p.type for p in self.repository.session.query(NotificationPreference)
            .filter(NotificationPreference.user_id == user_id).all()
        }
        for nt in NT:
            if nt.value not in existing_types:
                self.repository.session.add(NotificationPreference(
                    user_id=user_id,
                    type=nt.value,
                    enabled=True,
                ))
        self.repository.session.commit()

    async def create_notification(self, obj_in: NotificationCreate) -> Optional[NotificationResponse]:
        if not self.is_notification_enabled(obj_in.recipient_id, obj_in.type):
            return None

        db_obj = self.repository.create(obj_in)
        response_obj = NotificationResponse.model_validate(db_obj)
        
        payload = {
            "type": "NEW_NOTIFICATION",
            "data": response_obj.model_dump(mode="json")
        }
        await manager.send_personal_message(payload, obj_in.recipient_id)
        
        return response_obj
