"""Verification request model."""
import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    promoter_profile_id = Column(UUID(as_uuid=True), ForeignKey("promoter_profiles.id"), nullable=True, index=True)
    business_profile_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.id"), nullable=True, index=True)
    status = Column(Enum(VerificationStatus), nullable=False, default=VerificationStatus.PENDING, index=True)
    submitted_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    admin_notes = Column(Text, nullable=True)

    promoter_profile = relationship("PromoterProfile", back_populates="verification_requests")
    business_profile = relationship("BusinessProfile", back_populates="verification_requests")
    reviewer = relationship("User", backref="verification_reviews")
