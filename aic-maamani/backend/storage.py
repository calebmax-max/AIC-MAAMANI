from __future__ import annotations

import os
from pathlib import Path
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

# ── Cloudinary config (reads from environment / .env) ─────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

# ── Local uploads dir (kept for backwards-compat; no longer used for new uploads) ──
BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"


def ensure_upload_dirs() -> None:
    """Create local upload dirs (no-op if Cloudinary is configured, kept for compatibility)."""
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
    """Upload a file to Cloudinary and return its secure URL."""
    contents = await upload.read()

    # Use subdir as the Cloudinary folder (e.g. "gallery", "sermons")
    result = cloudinary.uploader.upload(
        contents,
        folder=f"aic_maamani/{subdir}",
        resource_type="auto",  # handles images and videos
    )

    return result["secure_url"]