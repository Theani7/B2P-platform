from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ExportRequest(BaseModel):
    module: str
    format: str = "csv"
    filters: Optional[Dict[str, Any]] = None
    sort: Optional[Dict[str, Any]] = None
    columns: Optional[List[str]] = None

class ExportResponse(BaseModel):
    download_url: str
    expires_at: str
    filename: str
