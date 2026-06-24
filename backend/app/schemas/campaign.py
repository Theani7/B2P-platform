"""Campaign schemas."""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator

from ..models.campaign import CampaignStatus, CampaignVisibility


class CampaignBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str = Field(..., min_length=20)
    category: str = Field(..., max_length=100)
    budget: float = Field(..., gt=0)
    location: str = Field(..., max_length=255)
    target_audience: Optional[str] = None
    requirements: Optional[str] = None
    start_date: datetime
    end_date: datetime
    visibility: CampaignVisibility = CampaignVisibility.PUBLIC

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date must be on or after start date")
        return self


class CampaignCreate(CampaignBase):
    status: CampaignStatus = CampaignStatus.DRAFT


class CampaignUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, min_length=20)
    category: Optional[str] = Field(None, max_length=100)
    budget: Optional[float] = Field(None, gt=0)
    location: Optional[str] = Field(None, max_length=255)
    target_audience: Optional[str] = None
    requirements: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    visibility: Optional[CampaignVisibility] = None
    status: Optional[CampaignStatus] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date is not None and self.end_date is not None:
            if self.end_date < self.start_date:
                raise ValueError("End date must be on or after start date")
        return self


class CampaignRead(CampaignBase):
    id: uuid.UUID
    business_profile_id: uuid.UUID
    status: CampaignStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignListRead(BaseModel):
    items: list[CampaignRead]
    total: int
    page: int
    limit: int
    pages: int
