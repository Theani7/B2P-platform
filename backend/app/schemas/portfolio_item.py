"""Portfolio item schema."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PortfolioItemBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    external_link: Optional[str] = Field(None, max_length=500)


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    external_link: Optional[str] = Field(None, max_length=500)


class PortfolioItemRead(PortfolioItemBase):
    id: uuid.UUID
    promoter_profile_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True