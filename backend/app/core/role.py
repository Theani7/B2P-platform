"""Centralised role definitions.

Import this instead of hard‑coding role strings anywhere in the codebase.
"""
from enum import Enum


class Role(str, Enum):
    BUSINESS = "BUSINESS"
    PROMOTER = "PROMOTER"
    ADMIN = "ADMIN"
