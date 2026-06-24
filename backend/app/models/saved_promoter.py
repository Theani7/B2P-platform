"""Saved promoter model (shortlist)."""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class SavedPromoter(Base):
    __tablename__ = "saved_promoters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_profile_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.id"), nullable=False)
    promoter_profile_id = Column(UUID(as_uuid=True), ForeignKey("promoter_profiles.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    business_profile = relationship("BusinessProfile", backref="saved_promoters")
    promoter_profile = relationship("PromoterProfile", backref="saved_by_businesses")

    __table_args__ = (
        UniqueConstraint("business_profile_id", "promoter_profile_id", name="uq_business_promoter_saved"),
    )
