"""Match result model for Smart Matching System."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True)
    promoter_profile_id = Column(UUID(as_uuid=True), ForeignKey("promoter_profiles.id"), nullable=False, index=True)
    score = Column(Float, nullable=False, default=0.0)
    classification = Column(String(20), nullable=False)
    score_breakdown = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    campaign = relationship("Campaign", backref="match_results")
    promoter_profile = relationship("PromoterProfile", backref="match_results")
