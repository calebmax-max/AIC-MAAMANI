from __future__ import annotations
from datetime import date, datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field, field_validator


# ─── Sermon Series ───────────────────────────────────────────────────────────

class SermonSeriesBase(BaseModel):
    id: str
    title: str
    cover_url: Optional[str] = None
    description: Optional[str] = None
    count: int = 0

class SermonSeriesCreate(SermonSeriesBase):
    pass

class SermonSeriesOut(SermonSeriesBase):
    model_config = {"from_attributes": True}


# ─── Sermon Notes ────────────────────────────────────────────────────────────

class SermonNotesBase(BaseModel):
    outline: Optional[List[dict]] = None
    key_scriptures: Optional[List[dict]] = None
    sections: Optional[List[dict]] = None
    reflection_questions: Optional[List[str]] = None
    prayer: Optional[str] = None

class SermonNotesCreate(SermonNotesBase):
    sermon_id: int

class SermonNotesOut(SermonNotesBase):
    id: int
    sermon_id: int
    model_config = {"from_attributes": True}


# ─── Sermon ──────────────────────────────────────────────────────────────────

class SermonBase(BaseModel):
    title: str
    speaker: str
    date: date
    duration: Optional[str] = None
    scripture: Optional[str] = None
    topic: Optional[str] = None
    series_id: Optional[str] = None
    thumbnail: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    document_url: Optional[str] = None
    document_text: Optional[str] = None
    has_notes: bool = False
    featured: bool = False

class SermonCreate(SermonBase):
    pass

class SermonOut(SermonBase):
    id: int
    notes: Optional[SermonNotesOut] = None
    model_config = {"from_attributes": True}


# ─── Event ───────────────────────────────────────────────────────────────────

class EventBase(BaseModel):
    title: str
    category: Optional[str] = None
    date: date
    time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    online: bool = False
    description: Optional[str] = None
    spots: Optional[int] = None

class EventCreate(EventBase):
    pass

class EventOut(EventBase):
    id: int
    spots_taken: Optional[int] = None
    model_config = {"from_attributes": True}


# ─── Event Registration ───────────────────────────────────────────────────────

class EventRegistrationCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

    @field_validator("email")
    @classmethod
    def email_must_look_valid(cls, v: str) -> str:
        email = v.strip()
        if "@" not in email or email.startswith("@") or email.endswith("@"):
            raise ValueError("Invalid email address")
        return email

class EventRegistrationOut(EventRegistrationCreate):
    id: int
    event_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── Blog ─────────────────────────────────────────────────────────────────────

class BlogPostBase(BaseModel):
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    emoji: Optional[str] = None
    hero_bg: Optional[str] = None
    title: str
    excerpt: Optional[str] = None
    author: Optional[str] = None
    initials: Optional[str] = None
    date: Optional[str] = None
    read_time: Optional[str] = None
    bio_role: Optional[str] = None
    bio: Optional[str] = None
    body: Optional[List[dict]] = None

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostOut(BlogPostBase):
    id: int
    model_config = {"from_attributes": True}


# ─── Gallery ──────────────────────────────────────────────────────────────────

class GalleryPhotoBase(BaseModel):
    album: Optional[str] = None
    src: str
    alt: Optional[str] = None
    height: Optional[int] = None

class GalleryPhotoCreate(GalleryPhotoBase):
    pass

class GalleryPhotoOut(GalleryPhotoBase):
    id: int
    model_config = {"from_attributes": True}


class GalleryVideoBase(BaseModel):
    title: str
    video_url: Optional[str] = None
    date: Optional[str] = None

class GalleryVideoCreate(GalleryVideoBase):
    pass

class GalleryVideoOut(GalleryVideoBase):
    id: int
    model_config = {"from_attributes": True}


# ─── Contact ──────────────────────────────────────────────────────────────────

class ContactMessageCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    subject: str
    message: str

    @field_validator("message")
    @classmethod
    def message_min_length(cls, v: str) -> str:
        if len(v.strip()) < 20:
            raise ValueError("Message must be at least 20 characters")
        return v

class ContactMessageOut(ContactMessageCreate):
    id: int
    created_at: datetime
    read: bool
    model_config = {"from_attributes": True}



# ─── Messages PIN ─────────────────────────────────────────────────────────────

class MessagesPinVerify(BaseModel):
    pin: str = Field(min_length=4)

class MessagesPinChange(BaseModel):
    current_pin: Optional[str] = None   # None only when setting PIN for the first time
    new_pin: str = Field(min_length=4)

class MessagesPinStatus(BaseModel):
    is_set: bool

# ─── About / Team ─────────────────────────────────────────────────────────────

class TeamMemberBase(BaseModel):
    name: str
    role: Optional[str] = None
    bio: Optional[str] = None
    photo: Optional[str] = None
    order: int = 0

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberOut(TeamMemberBase):
    id: int
    model_config = {"from_attributes": True}


# About / Site Content

class AboutSectionOut(BaseModel):
    title: str
    body: str
    model_config = {"from_attributes": True}


class TimelineItemOut(BaseModel):
    year: str
    title: str
    body: str
    model_config = {"from_attributes": True}


class ValueItemOut(BaseModel):
    icon: str
    label: str
    body: str
    model_config = {"from_attributes": True}


class BeliefItemOut(BaseModel):
    title: str
    body: str
    ref: str
    model_config = {"from_attributes": True}


class PastorProfileOut(BaseModel):
    name: str
    title: str
    quote: str
    photo: Optional[str] = None
    bio: List[str]
    credentials: List[str]


class AboutPageOut(BaseModel):
    story: AboutSectionOut
    vision: AboutSectionOut
    mission: AboutSectionOut
    timeline: List[TimelineItemOut]
    values: List[ValueItemOut]
    beliefs: List[BeliefItemOut]
    pastor: PastorProfileOut
    team: List[TeamMemberOut]
