from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from admin_auth import require_admin
from database import get_db
from models import GalleryPhoto, GalleryVideo
from schemas import (
    GalleryPhotoCreate, GalleryPhotoOut,
    GalleryVideoCreate, GalleryVideoOut,
)
from storage import save_upload

router = APIRouter()

VALID_ALBUMS = {"Church", "Outreach", "Community"}


def _clean_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


# ─── Photos ───────────────────────────────────────────────────────────────────

@router.get("/photos", response_model=List[GalleryPhotoOut])
def get_photos(
    album: Optional[str] = Query(None, description="Worship | Youth | Outreach 2024 | Community | Missions"),
    skip:  int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    q = db.query(GalleryPhoto)
    if album and album != "All":
        q = q.filter(GalleryPhoto.album == album)
    return q.offset(skip).limit(limit).all()


@router.get("/photos/{photo_id}", response_model=GalleryPhotoOut)
def get_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo


@router.post("/photos", response_model=GalleryPhotoOut, status_code=201, dependencies=[Depends(require_admin)])
async def create_photo(
    album: Optional[str] = Form(None),
    src: Optional[str] = Form(None),
    alt: Optional[str] = Form(None),
    height: Optional[int] = Form(None),
    image_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    if image_file:
        src = await save_upload(image_file, "gallery")
    photo = GalleryPhoto(
        album=_clean_text(album),
        src=_clean_text(src) or "",
        alt=_clean_text(alt),
        height=height,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db.delete(photo)
    db.commit()


@router.put("/photos/{photo_id}", response_model=GalleryPhotoOut, dependencies=[Depends(require_admin)])
async def update_photo(
    photo_id: int,
    album: Optional[str] = Form(None),
    src: Optional[str] = Form(None),
    alt: Optional[str] = Form(None),
    height: Optional[int] = Form(None),
    image_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if image_file:
        src = await save_upload(image_file, "gallery")

    photo.album = _clean_text(album) if album is not None else photo.album
    photo.src = _clean_text(src) or photo.src
    photo.alt = _clean_text(alt) if alt is not None else photo.alt
    photo.height = height if height is not None else photo.height
    db.commit()
    db.refresh(photo)
    return photo


@router.get("/albums", response_model=List[str])
def get_albums():
    return ["All"] + sorted(VALID_ALBUMS)


# ─── Videos ───────────────────────────────────────────────────────────────────

@router.get("/videos", response_model=List[GalleryVideoOut])
def get_videos(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(GalleryVideo).offset(skip).limit(limit).all()


@router.get("/videos/{video_id}", response_model=GalleryVideoOut)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(GalleryVideo).filter(GalleryVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.post("/videos", response_model=GalleryVideoOut, status_code=201, dependencies=[Depends(require_admin)])
async def create_video(
    title: str = Form(...),
    video_url: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    video_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    if video_file:
        video_url = await save_upload(video_file, "gallery")
    video = GalleryVideo(
        title=title.strip(),
        video_url=_clean_text(video_url),
        date=_clean_text(date),
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.delete("/videos/{video_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(GalleryVideo).filter(GalleryVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    db.delete(video)
    db.commit()


@router.put("/videos/{video_id}", response_model=GalleryVideoOut, dependencies=[Depends(require_admin)])
async def update_video(
    video_id: int,
    title: str = Form(...),
    video_url: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    video_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    video = db.query(GalleryVideo).filter(GalleryVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if video_file:
        video_url = await save_upload(video_file, "gallery")

    video.title = title.strip()
    video.video_url = _clean_text(video_url) if video_url is not None else video.video_url
    video.date = _clean_text(date) if date is not None else video.date
    db.commit()
    db.refresh(video)
    return video