"""Repository for profile completion. Not strictly needed if we just use calculations, but added for structure."""
from sqlalchemy.orm import Session
from app.models.user import User

class ProfileCompletionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_with_relations(self, user_id: str) -> User:
        return self.db.query(User).filter(User.id == user_id).first()
