from sqlalchemy.orm import Session
from .models import Achievement

PREDEFINED_ACHIEVEMENTS = [
    {
        "key": "COMPLETE_PROFILE",
        "title": "Profile Completed",
        "description": "Successfully completed all mandatory profile information.",
        "category": "BRONZE",
        "points": 50,
    },
    {
        "key": "COMPLETE_BUSINESS_PROFILE",
        "title": "Business Profile Completed",
        "description": "Successfully set up the business profile.",
        "category": "BRONZE",
        "points": 50,
    },
    {
        "key": "FIRST_PORTFOLIO",
        "title": "Portfolio Pioneer",
        "description": "Uploaded your first portfolio item.",
        "category": "SILVER",
        "points": 100,
    },
    {
        "key": "FIRST_SOCIAL_LINK",
        "title": "Social Butterfly",
        "description": "Added your first social media link.",
        "category": "BRONZE",
        "points": 25,
    }
]

def seed_achievements(db: Session):
    for ach_data in PREDEFINED_ACHIEVEMENTS:
        existing = db.query(Achievement).filter(Achievement.key == ach_data["key"]).first()
        if not existing:
            new_ach = Achievement(**ach_data)
            db.add(new_ach)
    db.commit()
