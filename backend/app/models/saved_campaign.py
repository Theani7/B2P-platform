"""Saved campaign model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class SavedCampaign(Base):
    __tablename__ = "saved_campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    promoter_profile_id = Column(UUID(as_uuid=True), ForeignKey("promoter_profiles.id"), nullable=False)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("promoter_profile_id", "campaign_id", name="uq_saved_campaign"),)

    promoter_profile = relationship("PromoterProfile", backref="saved_campaigns")
    campaign = relationship("Campaign")
