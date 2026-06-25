from uuid import UUID
from sqlalchemy.orm import Session
from .repository import NotificationRepository
from .schemas import NotificationCreate, NotificationResponse
from .connection_manager import manager
import asyncio

class NotificationService:
    def __init__(self, session: Session):
        self.repository = NotificationRepository(session)

    async def create_notification(self, obj_in: NotificationCreate) -> NotificationResponse:
        db_obj = self.repository.create(obj_in)
        response_obj = NotificationResponse.model_validate(db_obj)
        
        # Broadcast via WebSocket
        payload = {
            "type": "NEW_NOTIFICATION",
            "data": response_obj.model_dump(mode="json")
        }
        await manager.send_personal_message(payload, obj_in.recipient_id)
        
        return response_obj
