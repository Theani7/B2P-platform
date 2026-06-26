from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class ProfileCompletionResponse(BaseModel):
    percentage: int
    completed_items: List[Dict[str, Any]]
    missing_items: List[Dict[str, Any]]
    next_best_action: Optional[Dict[str, Any]]
