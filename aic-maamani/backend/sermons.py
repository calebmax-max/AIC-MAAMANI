from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from admin_auth import require_admin
from database import get_db
from models import Sermon, SermonSeries, SermonNotes
from schemas import (
    SermonCreate, SermonOut,
    SermonSeriesCreate, SermonSeriesOut,
    SermonNotesCreate, SermonNotesOut,
)

router = APIRouter()


# ─── Series ──────────────────────────────────────────────────────────────────

@router.get("/series", response_model=List[SermonSeriesOut])
def get_all_series(db: Session = Depends(get_db)):
    return db.query(SermonSeries).all()


@router.get("/series/{series_id}", response_model=SermonSeriesOut)
def get_series(series_id: str, db: Session = Depends(get_db)):
    series = db.query(SermonSeries).filter(SermonSeries.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    return series


@router.post("/series", response_model=SermonSeriesOut, status_code=201, dependencies=[Depends(require_admin)])
def create_series(payload: SermonSeriesCreate, db: Session = Depends(get_db)):
    series = SermonSeries(**payload.model_dump())
    db.add(series)
    db.commit()
    db.refresh(series)
    return series


# ─── Sermons ─────────────────────────────────────────────────────────────────

@router.get("", response_model=List[SermonOut])
def get_sermons(
    series:  Optional[str] = Query(None, description="Filter by series id"),
    speaker: Optional[str] = Query(None),
    topic:   Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(Sermon)
    if series:
        q = q.filter(Sermon.series_id == series)
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
def create_sermon(payload: SermonCreate, db: Session = Depends(get_db)):
    sermon = Sermon(**payload.model_dump())
    db.add(sermon)
    db.commit()
    db.refresh(sermon)
    return sermon


@router.put("/{sermon_id}", response_model=SermonOut, dependencies=[Depends(require_admin)])
def update_sermon(sermon_id: int, payload: SermonCreate, db: Session = Depends(get_db)):
    sermon = db.query(Sermon).filter(Sermon.id == sermon_id).first()
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    for key, value in payload.model_dump().items():
        setattr(sermon, key, value)
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
