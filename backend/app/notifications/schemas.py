from datetime import datetime
from typing import Optional, Any, Dict, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from .models import NotificationType

class NotificationPreferenceRead(BaseModel):
    id: UUID
    type: str
    enabled: bool

    model_config = ConfigDict(from_attributes=True)

class NotificationPreferencesResponse(BaseModel):
    preferences: List[NotificationPreferenceRead]

class NotificationPreferencesUpdate(BaseModel):
    preferences: List[dict]

class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    metadata: Optional[Dict[str, Any]] = Field(default=None, validation_alias="metadata_")

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
