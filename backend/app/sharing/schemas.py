from pydantic import BaseModel
from typing import Optional

class ShareProfileResponse(BaseModel):
    public_url: str
    qr_code_url: Optional[str] = None
    username: str
    slug: str
