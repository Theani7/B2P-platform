from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, HttpUrl

from app.models.deliverable import DeliverableStatus

class DeliverableBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_url: HttpUrl

class DeliverableCreate(DeliverableBase):
    pass

class DeliverableUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_url: Optional[HttpUrl] = None

class DeliverableReview(BaseModel):
    status: DeliverableStatus
    feedback: Optional[str] = None

class DeliverableResponse(DeliverableBase):
    id: UUID
    collaboration_id: UUID
    status: DeliverableStatus
    feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
