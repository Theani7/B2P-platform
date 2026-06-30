"""Business profile schemas."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BusinessProfileBase(BaseModel):
    company_name: str = Field(..., max_length=255)
    industry: str = Field(..., max_length=100)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)
    company_size: Optional[str] = Field(None, max_length=50)


class BusinessProfileCreate(BusinessProfileBase):
    pass


class BusinessProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)
    company_size: Optional[str] = Field(None, max_length=50)


class BusinessProfileRead(BusinessProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    verified: bool = False
    has_pending_verification: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True