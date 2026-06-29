import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.deliverable import Deliverable, DeliverableStatus
from app.models.collaboration import Collaboration
from app.schemas.deliverable import DeliverableCreate, DeliverableUpdate, DeliverableReview

def get_deliverables_by_collaboration(db: Session, collaboration_id: uuid.UUID) -> List[Deliverable]:
    return db.query(Deliverable).filter(Deliverable.collaboration_id == collaboration_id).order_by(Deliverable.created_at.desc()).all()

def create_deliverable(db: Session, collaboration_id: uuid.UUID, data: DeliverableCreate) -> Deliverable:
    # Ensure collaboration exists
    collaboration = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()
    if not collaboration:
        raise HTTPException(status_code=404, detail="Collaboration not found")
        
    deliverable = Deliverable(
        collaboration_id=collaboration_id,
        title=data.title,
        description=data.description,
        content_url=str(data.content_url),
        status=DeliverableStatus.IN_REVIEW
    )
    db.add(deliverable)
    db.commit()
    db.refresh(deliverable)
    return deliverable

def get_deliverable(db: Session, deliverable_id: uuid.UUID) -> Optional[Deliverable]:
    return db.query(Deliverable).filter(Deliverable.id == deliverable_id).first()

def review_deliverable(db: Session, deliverable_id: uuid.UUID, data: DeliverableReview) -> Deliverable:
    deliverable = get_deliverable(db, deliverable_id)
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
        
    deliverable.status = data.status
    if data.feedback is not None:
        deliverable.feedback = data.feedback
        
    db.commit()
    db.refresh(deliverable)
    return deliverable

def delete_deliverable(db: Session, deliverable_id: uuid.UUID):
    deliverable = get_deliverable(db, deliverable_id)
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    
    db.delete(deliverable)
    db.commit()
