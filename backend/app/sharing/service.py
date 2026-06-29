import os
import re
from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from .schemas import ShareProfileResponse

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

class SharingService:
    def __init__(self, session: Session):
        self.session = session

    def get_share_info(self, user: User) -> ShareProfileResponse:
        base_url = FRONTEND_URL.rstrip("/")

        if user.role == RoleEnum.PROMOTER and user.promoter_profile:
            # Correct public route: /promoters/:username
            username = user.promoter_profile.username
            slug = username
            public_url = f"{base_url}/promoters/{slug}"

        elif user.role == RoleEnum.BUSINESS and user.business_profile:
            # Businesses don't have a public profile page — share their campaign marketplace listing
            company_name = user.business_profile.company_name
            slug = re.sub(r'[^a-z0-9]+', '-', company_name.lower()).strip('-') or str(user.id)[:8]
            username = company_name
            # Link to the campaign marketplace so people can find their campaigns
            public_url = f"{base_url}/promoter/marketplace"

        else:
            slug = str(user.id)[:8]
            username = user.full_name or "User"
            public_url = f"{base_url}/promoter/marketplace"

        return ShareProfileResponse(
            public_url=public_url,
            qr_code_url=None,  # Generated client-side via react-qr-code
            username=username,
            slug=slug
        )
