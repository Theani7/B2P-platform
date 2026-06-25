from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from .models import NotificationType

class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    metadata: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    recipient_id: UUID
    actor_id: Optional[UUID] = None

class NotificationResponse(NotificationBase):
    id: UUID
    recipient_id: UUID
    actor_id: Optional[UUID] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UnreadCountResponse(BaseModel):
    count: int
