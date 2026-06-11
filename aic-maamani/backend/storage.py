from __future__ import annotations

import shutil
import time
import math
import random
from pathlib import Path

from fastapi import UploadFile

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"


def ensure_upload_dirs() -> None:
    (UPLOADS_DIR / "sermons").mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / "gallery").mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / "about").mkdir(parents=True, exist_ok=True)


def _safe_extension(filename: str | None) -> str:
    if not filename:
        return ""
    suffix = Path(filename).suffix.lower()
    if len(suffix) > 10:
        return ""
    return suffix


async def save_upload(upload: UploadFile, subdir: str) -> str:
    """Save an uploaded file locally and return its public URL path."""
    ext = _safe_extension(upload.filename)
    unique_name = f"{int(time.time())}-{math.floor(random.random() * 1_000_000)}{ext}"
    dest = UPLOADS_DIR / subdir / unique_name
    dest.parent.mkdir(parents=True, exist_ok=True)

    with dest.open("wb") as f:
        shutil.copyfileobj(upload.file, f)

    return f"/uploads/{subdir}/{unique_name}"
