"""Base application error.


Use this for all domain‑level exceptions so handlers can return
consistent envelope responses.
"""
from typing import Optional


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400, details: Optional[list] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or []
        super().__init__(self.message)
