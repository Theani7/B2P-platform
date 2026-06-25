import os
import shutil
from uuid import uuid4
from fastapi import UploadFile, HTTPException

MAX_IMAGE_SIZE = 10 * 1024 * 1024 # 10MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024 # 100MB

def save_upload_file(upload_file: UploadFile, is_video: bool = False) -> str:
    # Read first to check size, then reset cursor or just rely on spooling?
    # Actually, we can check size while writing or by checking file spool
    # A simple way for fastapi UploadFile is to seek to end, get pos, seek to 0
    upload_file.file.seek(0, 2)
    file_size = upload_file.file.tell()
    upload_file.file.seek(0)
    
    max_size = MAX_VIDEO_SIZE if is_video else MAX_IMAGE_SIZE
    
    if file_size > max_size:
        raise HTTPException(status_code=400, detail=f"File too large. Max size: {max_size} bytes")
        
    ext = os.path.splitext(upload_file.filename)[1]
    filename = f"{uuid4()}{ext}"
    
    base_dir = "uploads/portfolio/videos" if is_video else "uploads/portfolio/images"
    os.makedirs(base_dir, exist_ok=True)
    
    file_path = os.path.join(base_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return f"/{file_path}"
