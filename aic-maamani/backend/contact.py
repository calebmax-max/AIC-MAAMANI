from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from admin_auth import require_admin
from database import get_db
from models import ContactMessage
from schemas import ContactMessageCreate, ContactMessageOut

router = APIRouter()

VALID_SUBJECTS = {
    "general",
    "prayer-request",
    "pastoral-care",
    "volunteering",
    "events",
    "media",
    "other",
}


@router.post("", response_model=ContactMessageOut, status_code=201)
def submit_message(payload: ContactMessageCreate, db: Session = Depends(get_db)):
    if payload.subject not in VALID_SUBJECTS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid subject. Choose from: {', '.join(sorted(VALID_SUBJECTS))}",
        )
    msg = ContactMessage(**payload.model_dump())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# ─── Admin-style read endpoints (protect with auth in production) ─────────────

@router.get("", response_model=List[ContactMessageOut], dependencies=[Depends(require_admin)])
def get_messages(unread_only: bool = False, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    q = db.query(ContactMessage)
    if unread_only:
        q = q.filter(ContactMessage.read == False)
    return q.order_by(ContactMessage.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/{message_id}/read", response_model=ContactMessageOut, dependencies=[Depends(require_admin)])
def mark_as_read(message_id: int, db: Session = Depends(get_db)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.read = True
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{message_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_message(message_id: int, db: Session = Depends(get_db)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
