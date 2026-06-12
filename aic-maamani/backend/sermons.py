from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from admin_auth import require_admin
from database import get_db
from models import Sermon, SermonNotes
from schemas import (
    SermonOut,
    SermonNotesCreate, SermonNotesOut,
)

router = APIRouter()


class SermonPayload(BaseModel):
    title: str
    speaker: str
    date: date
    duration: Optional[str] = None
    scripture: Optional[str] = None
    topic: Optional[str] = None
    document_text: Optional[str] = None
    featured: bool = False


def _clean_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


# ─── Sermons ─────────────────────────────────────────────────────────────────

@router.get("", response_model=List[SermonOut])
def get_sermons(
    speaker: Optional[str] = Query(None),
    topic:   Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(Sermon)
    if speaker:
        q = q.filter(Sermon.speaker.ilike(f"%{speaker}%"))
    if topic:
        q = q.filter(Sermon.topic == topic)
    if featured is not None:
        q = q.filter(Sermon.featured == featured)
    return q.order_by(Sermon.date.desc()).offset(skip).limit(limit).all()


@router.get("/featured", response_model=SermonOut)
def get_featured_sermon(db: Session = Depends(get_db)):
    sermon = db.query(Sermon).filter(Sermon.featured == True).order_by(Sermon.date.desc()).first()
    if not sermon:
        raise HTTPException(status_code=404, detail="No featured sermon found")
    return sermon


@router.get("/{sermon_id}", response_model=SermonOut)
def get_sermon(sermon_id: int, db: Session = Depends(get_db)):
    sermon = db.query(Sermon).filter(Sermon.id == sermon_id).first()
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return sermon


@router.post("", response_model=SermonOut, status_code=201, dependencies=[Depends(require_admin)])
def create_sermon(payload: SermonPayload, db: Session = Depends(get_db)):
    sermon = Sermon(
        title=payload.title.strip(),
        speaker=payload.speaker.strip(),
        date=payload.date,
        duration=_clean_text(payload.duration),
        scripture=_clean_text(payload.scripture),
        topic=_clean_text(payload.topic),
        document_text=_clean_text(payload.document_text),
        featured=payload.featured,
    )
    db.add(sermon)
    db.commit()
    db.refresh(sermon)
    return sermon


@router.put("/{sermon_id}", response_model=SermonOut, dependencies=[Depends(require_admin)])
def update_sermon(sermon_id: int, payload: SermonPayload, db: Session = Depends(get_db)):
    sermon = db.query(Sermon).filter(Sermon.id == sermon_id).first()
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")

    for field, value in {
        "title":         payload.title.strip(),
        "speaker":       payload.speaker.strip(),
        "date":          payload.date,
        "duration":      _clean_text(payload.duration),
        "scripture":     _clean_text(payload.scripture),
        "topic":         _clean_text(payload.topic),
        "document_text": _clean_text(payload.document_text),
        "featured":      payload.featured,
    }.items():
        setattr(sermon, field, value)
    db.commit()
    db.refresh(sermon)
    return sermon


@router.delete("/{sermon_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_sermon(sermon_id: int, db: Session = Depends(get_db)):
    sermon = db.query(Sermon).filter(Sermon.id == sermon_id).first()
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    db.delete(sermon)
    db.commit()


# ─── Sermon Notes ─────────────────────────────────────────────────────────────

@router.get("/{sermon_id}/notes", response_model=SermonNotesOut)
def get_sermon_notes(sermon_id: int, db: Session = Depends(get_db)):
    notes = db.query(SermonNotes).filter(SermonNotes.sermon_id == sermon_id).first()
    if not notes:
        raise HTTPException(status_code=404, detail="Notes not found for this sermon")
    return notes


@router.post("/{sermon_id}/notes", response_model=SermonNotesOut, status_code=201, dependencies=[Depends(require_admin)])
def create_sermon_notes(sermon_id: int, payload: SermonNotesCreate, db: Session = Depends(get_db)):
    sermon = db.query(Sermon).filter(Sermon.id == sermon_id).first()
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    existing = db.query(SermonNotes).filter(SermonNotes.sermon_id == sermon_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Notes already exist for this sermon")
    notes = SermonNotes(**payload.model_dump(), sermon_id=sermon_id)
    sermon.has_notes = True
    db.add(notes)
    db.commit()
    db.refresh(notes)
    return notes


@router.put("/{sermon_id}/notes", response_model=SermonNotesOut, dependencies=[Depends(require_admin)])
def update_sermon_notes(sermon_id: int, payload: SermonNotesCreate, db: Session = Depends(get_db)):
    notes = db.query(SermonNotes).filter(SermonNotes.sermon_id == sermon_id).first()
    if not notes:
        raise HTTPException(status_code=404, detail="Notes not found")
    for key, value in payload.model_dump(exclude={"sermon_id"}).items():
        setattr(notes, key, value)
    db.commit()
    db.refresh(notes)
    return notes