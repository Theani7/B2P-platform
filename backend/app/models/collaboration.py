"""Collaboration model."""
import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class CollaborationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Collaboration(Base):
    __tablename__ = "collaborations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True)
    business_profile_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.id"), nullable=False, index=True)
    promoter_profile_id = Column(UUID(as_uuid=True), ForeignKey("promoter_profiles.id"), nullable=False, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("campaign_applications.id"), nullable=True)
    invitation_id = Column(UUID(as_uuid=True), ForeignKey("campaign_invitations.id"), nullable=True)
    status = Column(Enum(CollaborationStatus), nullable=False, default=CollaborationStatus.ACTIVE)
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    campaign = relationship("Campaign", backref="collaborations")
    business_profile = relationship("BusinessProfile", backref="collaborations")
    promoter_profile = relationship("PromoterProfile", backref="collaborations")
    application = relationship("CampaignApplication", backref="collaboration", uselist=False)
    invitation = relationship("CampaignInvitation", backref="collaboration", uselist=False)
