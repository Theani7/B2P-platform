from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from .repository import NotificationRepository
from .schemas import NotificationCreate, NotificationResponse
from .connection_manager import manager
from .models import NotificationType

class NotificationService:
    def __init__(self, session: Session):
        self.repository = NotificationRepository(session)

    def is_notification_enabled(self, user_id: UUID, type: NotificationType) -> bool:
        pref = self.repository.get_preference(user_id, type)
        return pref.enabled if pref else True

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
