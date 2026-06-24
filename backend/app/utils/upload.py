"""Media upload service for local file storage."""
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile, HTTPException, status


UPLOAD_BASE = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def validate_image(file: UploadFile) -> None:
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File type {ext} not allowed")


def save_upload(file: UploadFile, subfolder: str) -> str:
    validate_image(file)
    folder = UPLOAD_BASE / subfolder
    folder.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename).suffix.lower()
    filename = f"{uuid.uuid4()}{ext}"
    path = folder / filename
    content = file.file.read()
    path.write_bytes(content)
    return f"/uploads/{subfolder}/{filename}"


def delete_upload(relative_path: str) -> None:
    if relative_path:
        path = Path(relative_path).resolve()
        try:
            path.unlink(missing_ok=True)
        except Exception:
            pass