from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"


def ensure_upload_dirs() -> None:
    (UPLOADS_DIR / "sermons").mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / "gallery").mkdir(parents=True, exist_ok=True)


def _safe_extension(filename: str | None) -> str:
    if not filename:
        return ""
    suffix = Path(filename).suffix.lower()
    if len(suffix) > 10:
        return ""
    return suffix


async def save_upload(upload: UploadFile, subdir: str) -> str:
    ensure_upload_dirs()
    target_dir = UPLOADS_DIR / subdir
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{_safe_extension(upload.filename)}"
    target_path = target_dir / filename
    contents = await upload.read()
    target_path.write_bytes(contents)
    return f"/uploads/{subdir}/{filename}"
