from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict
from uuid import UUID

class ActivityLogBase(BaseModel):
    action: str
    title: str
    description: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    metadata_info: Optional[Dict[str, Any]] = None

class ActivityLogCreate(ActivityLogBase):
    actor_id: Optional[UUID] = None
    actor_role: Optional[str] = None

class ActivityLogResponse(ActivityLogBase):
    id: UUID
    actor_id: Optional[UUID] = None
    actor_role: Optional[str] = None
    created_at: datetime
    
    # Optional denormalized fields for the frontend
    actor_name: Optional[str] = None
    actor_avatar: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedActivityResponse(BaseModel):
    items: List[ActivityLogResponse]
    total: int
    page: int
    size: int
    pages: int
