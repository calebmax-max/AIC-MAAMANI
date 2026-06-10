from datetime import date
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree as ET
import zipfile
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from admin_auth import require_admin
from database import get_db
from models import Sermon, SermonSeries, SermonNotes
from schemas import (
    SermonCreate, SermonOut,
    SermonSeriesCreate, SermonSeriesOut,
    SermonNotesCreate, SermonNotesOut,
)
from storage import save_upload

router = APIRouter()


def _clean_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _extract_document_text(file_bytes: bytes, filename: Optional[str]) -> Optional[str]:
    suffix = Path(filename or "").suffix.lower()

    if suffix == ".txt":
        for encoding in ("utf-8", "utf-16", "cp1252", "latin-1"):
            try:
                text = file_bytes.decode(encoding).strip()
            except UnicodeDecodeError:
                continue
            if text:
                return text
        return None

    if suffix == ".docx":
        try:
            with zipfile.ZipFile(BytesIO(file_bytes)) as docx:
                xml_data = docx.read("word/document.xml")
        except (KeyError, OSError, zipfile.BadZipFile):
            return None

        try:
            root = ET.fromstring(xml_data)
        except ET.ParseError:
            return None

        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        paragraphs: list[str] = []
        for paragraph in root.findall(".//w:p", ns):
            pieces = [node.text for node in paragraph.findall(".//w:t", ns) if node.text]
            text = "".join(pieces).strip()
            if text:
                paragraphs.append(text)
        return "\n".join(paragraphs).strip() or None

    return None


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
async def create_sermon(
    title: str = Form(...),
    speaker: str = Form(...),
    date: date = Form(...),
    duration: Optional[str] = Form(None),
    scripture: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    series_id: Optional[str] = Form(None),
    thumbnail: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    audio_url: Optional[str] = Form(None),
    document_url: Optional[str] = Form(None),
    document_text: Optional[str] = Form(None),
    has_notes: bool = Form(False),
    featured: bool = Form(False),
    thumbnail_file: UploadFile | None = File(None),
    video_file: UploadFile | None = File(None),
    audio_file: UploadFile | None = File(None),
    document_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    cleaned_document_text = _clean_text(document_text)

    if thumbnail_file:
        thumbnail = await save_upload(thumbnail_file, "sermons")
    if video_file:
        video_url = await save_upload(video_file, "sermons")
    if audio_file:
        audio_url = await save_upload(audio_file, "sermons")
    if document_file:
        document_bytes = await document_file.read()
        if cleaned_document_text is None:
            cleaned_document_text = _extract_document_text(document_bytes, document_file.filename)
        await document_file.seek(0)
        document_url = await save_upload(document_file, "sermons")

    sermon = Sermon(
        title=title.strip(),
        speaker=speaker.strip(),
        date=date,
        duration=_clean_text(duration),
        scripture=_clean_text(scripture),
        topic=_clean_text(topic),
        series_id=_clean_text(series_id),
        thumbnail=_clean_text(thumbnail),
        video_url=_clean_text(video_url),
        audio_url=_clean_text(audio_url),
        document_url=_clean_text(document_url),
        document_text=cleaned_document_text,
        has_notes=has_notes,
        featured=featured,
    )
    db.add(sermon)
    db.commit()
    db.refresh(sermon)
    return sermon


@router.put("/{sermon_id}", response_model=SermonOut, dependencies=[Depends(require_admin)])
async def update_sermon(
    sermon_id: int,
    title: str = Form(...),
    speaker: str = Form(...),
    date: date = Form(...),
    duration: Optional[str] = Form(None),
    scripture: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    series_id: Optional[str] = Form(None),
    thumbnail: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    audio_url: Optional[str] = Form(None),
    document_url: Optional[str] = Form(None),
    document_text: Optional[str] = Form(None),
    has_notes: bool = Form(False),
    featured: bool = Form(False),
    thumbnail_file: UploadFile | None = File(None),
    video_file: UploadFile | None = File(None),
    audio_file: UploadFile | None = File(None),
    document_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    sermon = db.query(Sermon).filter(Sermon.id == sermon_id).first()
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")

    cleaned_document_text = _clean_text(document_text)

    if thumbnail_file:
        thumbnail = await save_upload(thumbnail_file, "sermons")
    if video_file:
        video_url = await save_upload(video_file, "sermons")
    if audio_file:
        audio_url = await save_upload(audio_file, "sermons")
    if document_file:
        document_bytes = await document_file.read()
        if cleaned_document_text is None:
            cleaned_document_text = _extract_document_text(document_bytes, document_file.filename)
        await document_file.seek(0)
        document_url = await save_upload(document_file, "sermons")

    sermon.title = title.strip()
    sermon.speaker = speaker.strip()
    sermon.date = date
    sermon.duration = _clean_text(duration)
    sermon.scripture = _clean_text(scripture)
    sermon.topic = _clean_text(topic)
    sermon.series_id = _clean_text(series_id)
    sermon.thumbnail = _clean_text(thumbnail) if thumbnail is not None else sermon.thumbnail
    sermon.video_url = _clean_text(video_url) if video_url is not None else sermon.video_url
    sermon.audio_url = _clean_text(audio_url) if audio_url is not None else sermon.audio_url
    sermon.document_url = _clean_text(document_url) if document_url is not None else sermon.document_url
    sermon.document_text = cleaned_document_text if document_text is not None or document_file else sermon.document_text
    sermon.has_notes = has_notes
    sermon.featured = featured
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
