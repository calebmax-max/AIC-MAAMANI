from datetime import date, datetime
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer,
    String, Text, Date, JSON
)
from sqlalchemy.orm import relationship
from .database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(255), nullable=False, unique=True, index=True)
    password_salt = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role               = Column(String(255), nullable=False, default="full_admin")
    is_active          = Column(Boolean, default=True)
    messages_pin_salt  = Column(String(255), nullable=True)
    messages_pin_hash  = Column(String(255), nullable=True)
    created_at         = Column(DateTime, default=datetime.utcnow)
    updated_at         = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ─── Sermons ────────────────────────────────────────────────────────────────

class SermonSeries(Base):
    __tablename__ = "sermon_series"

    id          = Column(String(255), primary_key=True)          # e.g. "john"
    title       = Column(String(255), nullable=False)
    cover_url   = Column(String(255))
    description = Column(Text)
    count       = Column(Integer, default=0)

    sermons = relationship("Sermon", back_populates="series_rel")


class Sermon(Base):
    __tablename__ = "sermons"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(255), nullable=False)
    speaker      = Column(String(255), nullable=False)
    date         = Column(Date, nullable=False)
    duration     = Column(String(255))                             # e.g. "42 min"
    scripture    = Column(String(255))
    topic        = Column(String(255))
    series_id    = Column(String(255), ForeignKey("sermon_series.id"))
    thumbnail    = Column(String(255))
    video_url    = Column(String(255))
    audio_url    = Column(String(255))
    document_url  = Column(String(255))
    document_text = Column(Text, nullable=True)
    has_notes     = Column(Boolean, default=False)
    featured     = Column(Boolean, default=False)

    series_rel  = relationship("SermonSeries", back_populates="sermons")
    notes       = relationship("SermonNotes", back_populates="sermon", uselist=False)


class SermonNotes(Base):
    __tablename__ = "sermon_notes"

    id          = Column(Integer, primary_key=True, index=True)
    sermon_id   = Column(Integer, ForeignKey("sermons.id"), unique=True)

    # Stored as JSON arrays / objects
    outline              = Column(JSON)    # [{ref, point, sub}]
    key_scriptures       = Column(JSON)    # [{ref, text}]
    sections             = Column(JSON)    # [{heading, body}]
    reflection_questions = Column(JSON)    # [str]
    prayer               = Column(Text)

    sermon = relationship("Sermon", back_populates="notes")


# ─── Events ─────────────────────────────────────────────────────────────────

class Event(Base):
    __tablename__ = "events"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    category    = Column(String(255))                             # worship | youth | outreach | small-groups
    date        = Column(Date, nullable=False)
    time        = Column(String(255))                             # "10:00 AM"
    end_time    = Column(String(255))
    location    = Column(String(255))
    online      = Column(Boolean, default=False)
    description = Column(Text)
    spots       = Column(Integer, nullable=True)            # None = unlimited

    registrations = relationship("EventRegistration", back_populates="event")


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id         = Column(Integer, primary_key=True, index=True)
    event_id   = Column(Integer, ForeignKey("events.id"))
    name       = Column(String(255), nullable=False)
    email      = Column(String(255), nullable=False)
    phone      = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="registrations")


# ─── Blog / Devotionals ─────────────────────────────────────────────────────

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id        = Column(Integer, primary_key=True, index=True)
    category  = Column(String(255))                               # devotional | teaching | testimony | announcement
    tags      = Column(JSON)                                 # ["faith", "prayer"]
    emoji     = Column(String(255))
    hero_bg   = Column(String(255))
    title     = Column(String(255), nullable=False)
    excerpt   = Column(Text)
    author    = Column(String(255))
    initials  = Column(String(255))
    date      = Column(String(255))                               # human-readable, e.g. "June 2, 2026"
    read_time = Column(String(255))
    bio_role  = Column(String(255))
    bio       = Column(Text)
    body      = Column(JSON)                                 # [{type: "p"|"quote", text: "..."}]


# ─── Gallery ────────────────────────────────────────────────────────────────

class GalleryPhoto(Base):
    __tablename__ = "gallery_photos"

    id     = Column(Integer, primary_key=True, index=True)
    album  = Column(String(255))                                  # Worship | Youth | Outreach 2024 | Community | Missions
    src    = Column(String(255))                                  # image URL
    alt    = Column(String(255))
    height = Column(Integer)                                 # display hint


class GalleryVideo(Base):
    __tablename__ = "gallery_videos"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String(255), nullable=False)
    video_url  = Column(String(255))
    date       = Column(String(255))                              # human-readable


# ─── Contact ────────────────────────────────────────────────────────────────

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    email      = Column(String(255), nullable=True)
    phone      = Column(String(255))
    subject    = Column(String(255))
    message    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read       = Column(Boolean, default=False)


# ─── About (team members / leadership) ──────────────────────────────────────

class TeamMember(Base):
    __tablename__ = "team_members"

    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String(255), nullable=False)
    role     = Column(String(255))
    bio      = Column(Text)
    photo    = Column(String(255))
    order    = Column(Integer, default=0)                   # display order