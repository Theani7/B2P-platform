"""Review model for Review & Rating System."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    collaboration_id = Column(UUID(as_uuid=True), ForeignKey("collaborations.id"), nullable=False, index=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    reviewee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    collaboration = relationship("Collaboration", backref="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="reviews_written")
    reviewee = relationship("User", foreign_keys=[reviewee_id], backref="reviews_received")

    __table_args__ = (
        UniqueConstraint("collaboration_id", "reviewer_id", name="uq_collaboration_reviewer"),
    )
