from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.database import get_db
from models.models import Event, EventRegistration
from schemas.schemas import (
    EventCreate, EventOut,
    EventRegistrationCreate, EventRegistrationOut,
)

router = APIRouter()


@router.get("", response_model=List[EventOut])
def get_events(
    category:   Optional[str]  = Query(None),
    upcoming:   Optional[bool] = Query(None, description="True = only future events"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    q = db.query(Event)
    if category:
        q = q.filter(Event.category == category)
    if upcoming:
        q = q.filter(Event.date >= date.today())
    events = q.order_by(Event.date.asc()).offset(skip).limit(limit).all()

    result = []
    for ev in events:
        spots_taken = db.query(EventRegistration).filter(EventRegistration.event_id == ev.id).count()
        out = EventOut.model_validate(ev)
        out.spots_taken = spots_taken
        result.append(out)
    return result


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    spots_taken = db.query(EventRegistration).filter(EventRegistration.event_id == ev.id).count()
    out = EventOut.model_validate(ev)
    out.spots_taken = spots_taken
    return out


@router.post("", response_model=EventOut, status_code=201)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    ev = Event(**payload.model_dump())
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@router.put("/{event_id}", response_model=EventOut)
def update_event(event_id: int, payload: EventCreate, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in payload.model_dump().items():
        setattr(ev, key, value)
    db.commit()
    db.refresh(ev)
    return ev


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(ev)
    db.commit()


# ─── Registrations ────────────────────────────────────────────────────────────

@router.post("/{event_id}/register", response_model=EventRegistrationOut, status_code=201)
def register_for_event(
    event_id: int,
    payload: EventRegistrationCreate,
    db: Session = Depends(get_db),
):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check capacity
    if ev.spots is not None:
        taken = db.query(EventRegistration).filter(EventRegistration.event_id == event_id).count()
        if taken >= ev.spots:
            raise HTTPException(status_code=409, detail="Event is fully booked")

    # Prevent duplicate registration by same email
    duplicate = (
        db.query(EventRegistration)
        .filter(EventRegistration.event_id == event_id, EventRegistration.email == payload.email)
        .first()
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="This email is already registered for the event")

    reg = EventRegistration(**payload.model_dump(), event_id=event_id)
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


@router.get("/{event_id}/registrations", response_model=List[EventRegistrationOut])
def get_registrations(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    return db.query(EventRegistration).filter(EventRegistration.event_id == event_id).all()