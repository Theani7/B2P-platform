from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel
from app.models.chat import MessageType

class MessageBase(BaseModel):
    message: str
    message_type: MessageType = MessageType.TEXT

class MessageCreate(MessageBase):
    pass

class MessageRead(MessageBase):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    edited_at: Optional[datetime]
    read_at: Optional[datetime]
    is_deleted: bool
    created_at: datetime
    class Config:
        from_attributes = True

class ConversationRead(BaseModel):
    id: UUID
    collaboration_id: UUID
    created_at: datetime
    updated_at: datetime
    unread_count: int = 0
    last_message: Optional[MessageRead] = None
    participants: List[dict] = []
    class Config:
        from_attributes = True
