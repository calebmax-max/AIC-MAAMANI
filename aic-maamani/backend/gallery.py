from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import GalleryPhoto, GalleryVideo
from schemas.schemas import (
    GalleryPhotoCreate, GalleryPhotoOut,
    GalleryVideoCreate, GalleryVideoOut,
)

router = APIRouter()

VALID_ALBUMS = {"Worship", "Youth", "Outreach 2024", "Community", "Missions"}


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


@router.post("/photos", response_model=GalleryPhotoOut, status_code=201)
def create_photo(payload: GalleryPhotoCreate, db: Session = Depends(get_db)):
    photo = GalleryPhoto(**payload.model_dump())
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}", status_code=204)
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db.delete(photo)
    db.commit()


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


@router.post("/videos", response_model=GalleryVideoOut, status_code=201)
def create_video(payload: GalleryVideoCreate, db: Session = Depends(get_db)):
    video = GalleryVideo(**payload.model_dump())
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.delete("/videos/{video_id}", status_code=204)
def delete_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(GalleryVideo).filter(GalleryVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    db.delete(video)
    db.commit()