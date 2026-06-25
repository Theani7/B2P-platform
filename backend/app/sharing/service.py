from sqlalchemy.orm import Session
import re
from app.models.user import User, RoleEnum
from .schemas import ShareProfileResponse

class SharingService:
    def __init__(self, session: Session):
        self.session = session

    def get_share_info(self, user: User) -> ShareProfileResponse:
        base_url = "http://localhost:5173" # For local dev
        
        if user.role == RoleEnum.PROMOTER and user.promoter_profile:
            username = user.promoter_profile.username
            slug = username
            public_url = f"{base_url}/p/{slug}"
            
        elif user.role == RoleEnum.BUSINESS and user.business_profile:
            # Generate slug from company name
            company_name = user.business_profile.company_name
            slug = re.sub(r'[^a-z0-9]+', '-', company_name.lower()).strip('-')
            # fallback if empty
            if not slug:
                slug = str(user.id)[:8]
            username = company_name
            public_url = f"{base_url}/b/{slug}"
            
        else:
            # Admin or incomplete profile
            slug = str(user.id)[:8]
            username = user.full_name or "User"
            public_url = f"{base_url}/u/{slug}"
            
        return ShareProfileResponse(
            public_url=public_url,
            qr_code_url=None, # Generated client-side via react-qr-code
            username=username,
            slug=slug
        )
