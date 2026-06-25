from pydantic import BaseModel
from typing import List, Optional

class ProfileCompletionResponse(BaseModel):
    percentage: int
    completed_items: List[str]
    missing_items: List[str]
    next_best_action: Optional[str]
