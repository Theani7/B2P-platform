import os
import sys
import uuid
import random
from datetime import datetime, timedelta

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, RoleEnum
from app.models.business_profile import BusinessProfile
from app.models.promoter_profile import PromoterProfile
from app.models.campaign import Campaign
from app.models.application import Application
from app.models.collaboration import Collaboration

def clear_db(db: Session):
    print("Clearing existing data...")
    db.query(Collaboration).delete()
    db.query(Application).delete()
    db.query(Campaign).delete()
    db.query(BusinessProfile).delete()
    db.query(PromoterProfile).delete()
    db.query(User).delete()
    db.commit()

def seed_data():
    db = SessionLocal()
    try:
        clear_db(db)
        print("Seeding new data...")

        # Create Admin
        admin = User(
            id=uuid.uuid4(),
            email="admin@b2pconnect.com",
            hashed_password=get_password_hash("Admin123!"),
            full_name="System Admin",
            role=RoleEnum.ADMIN,
            is_active=True,
            has_profile=True,
            is_email_verified=True
        )
        db.add(admin)

        # Create Businesses
        businesses = []
        for i in range(1, 4):
            b_user = User(
                id=uuid.uuid4(),
                email=f"business{i}@example.com",
                hashed_password=get_password_hash("Password123!"),
                full_name=f"Business Owner {i}",
                role=RoleEnum.BUSINESS,
                is_active=True,
                has_profile=True,
                is_email_verified=True
            )
            db.add(b_user)
            db.flush()
            
            b_profile = BusinessProfile(
                id=uuid.uuid4(),
                user_id=b_user.id,
                company_name=f"TechBrand {i} Inc",
                industry="Technology",
                description="A leading technology brand focusing on innovative software products.",
                location="Kathmandu, Nepal",
                website="https://example.com",
                company_size="50-200"
            )
            db.add(b_profile)
            businesses.append(b_profile)

        # Create Promoters
        promoters = []
        niches = ["TECH", "LIFESTYLE", "FITNESS"]
        for i in range(1, 6):
            p_user = User(
                id=uuid.uuid4(),
                email=f"promoter{i}@example.com",
                hashed_password=get_password_hash("Password123!"),
                full_name=f"Creator Name {i}",
                role=RoleEnum.PROMOTER,
                is_active=True,
                has_profile=True,
                is_email_verified=True
            )
            db.add(p_user)
            db.flush()

            p_profile = PromoterProfile(
                id=uuid.uuid4(),
                user_id=p_user.id,
                username=f"creator_{i}",
                headline="Creative content creator",
                bio="I make engaging tech and lifestyle content.",
                niche=niches[i % 3],
                location="Kathmandu, Nepal",
                followers_count=random.randint(5000, 500000),
                engagement_rate=round(random.uniform(1.5, 12.0), 2),
                verified=(i % 2 == 0)
            )
            db.add(p_profile)
            promoters.append(p_profile)
            
        db.commit()

        # Create Campaigns
        campaigns = []
        for b in businesses:
            for i in range(2):
                camp = Campaign(
                    id=uuid.uuid4(),
                    business_profile_id=b.id,
                    title=f"{b.company_name} - Campaign {i+1}",
                    description="We are looking for creative promoters to review our new software product.",
                    requirements="Must have 10k+ followers. Must post 1 video.",
                    budget=random.randint(10000, 100000),
                    platform="Instagram, YouTube",
                    target_audience="Tech Enthusiasts",
                    campaign_type="Video Review",
                    status="ACTIVE",
                    deadline=datetime.utcnow() + timedelta(days=30)
                )
                db.add(camp)
                campaigns.append(camp)
        
        db.commit()

        # Create Applications
        for c in campaigns:
            # Randomly select a promoter
            p = random.choice(promoters)
            app = Application(
                id=uuid.uuid4(),
                campaign_id=c.id,
                promoter_profile_id=p.id,
                message="I would love to work on this campaign! My audience matches your target demographic perfectly.",
                status="PENDING",
                proposed_rate=c.budget * 0.9
            )
            db.add(app)
        
        db.commit()
        print("Database seeded successfully with realistic demo data.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
