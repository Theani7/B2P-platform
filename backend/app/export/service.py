import csv
import uuid
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from app.models.campaign import Campaign
from app.models.business_profile import BusinessProfile
from app.models.promoter_profile import PromoterProfile
from .schemas import ExportRequest, ExportResponse

EXPORT_DIR = os.path.join(os.getcwd(), "uploads", "exports")
os.makedirs(EXPORT_DIR, exist_ok=True)

class ExportService:
    def __init__(self, session: Session):
        self.session = session

    def _get_data(self, request: ExportRequest, user: User) -> List[Dict[str, Any]]:
        # Simplified data extraction logic
        if request.module == "campaigns":
            q = self.session.query(Campaign)
            if user.role == RoleEnum.BUSINESS:
                q = q.filter(Campaign.business_profile_id == getattr(user.business_profile, 'id', None))
            elif user.role == RoleEnum.PROMOTER:
                q = q.filter(Campaign.status == "ACTIVE")
            
            camps = q.all()
            return [{"id": str(c.id), "title": c.title, "status": c.status, "budget": c.budget} for c in camps]
            
        elif request.module == "promoters":
            proms = self.session.query(PromoterProfile).all()
            return [{"id": str(p.id), "username": p.username, "niche": p.niche, "followers": p.followers_count} for p in proms]
            
        return [{"message": f"Module {request.module} export not fully implemented for {user.role}"}]

    def export_data(self, request: ExportRequest, user: User) -> ExportResponse:
        data = self._get_data(request, user)
        
        # Filter columns if specified
        if request.columns and data:
            filtered_data = []
            for row in data:
                filtered_row = {k: v for k, v in row.items() if k in request.columns}
                filtered_data.append(filtered_row)
            data = filtered_data

        timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{request.module}_{timestamp}_{uuid.uuid4().hex[:6]}.csv"
        filepath = os.path.join(EXPORT_DIR, filename)

        if data:
            keys = data[0].keys()
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(data)
        else:
            with open(filepath, 'w') as f:
                f.write("No data found")

        # Fake expiry (no cleanup implemented in this sprint)
        expires = (datetime.utcnow() + timedelta(days=1)).isoformat()
        
        return ExportResponse(
            download_url=f"/exports/{filename}",
            expires_at=expires,
            filename=filename
        )
