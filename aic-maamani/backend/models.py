from datetime import date, datetime
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer,
    String, Text, Date, JSON
)
from sqlalchemy.orm import relationship
from db.database import Base


# ─── Sermons ────────────────────────────────────────────────────────────────

class SermonSeries(Base):
    __tablename__ = "sermon_series"

    id          = Column(String, primary_key=True)          # e.g. "john"
    title       = Column(String, nullable=False)
    cover_url   = Column(String)
    description = Column(Text)
    count       = Column(Integer, default=0)

    sermons = relationship("Sermon", back_populates="series_rel")


class Sermon(Base):
    __tablename__ = "sermons"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    speaker     = Column(String, nullable=False)
    date        = Column(Date, nullable=False)
    duration    = Column(String)                             # e.g. "42 min"
    scripture   = Column(String)
    topic       = Column(String)
    series_id   = Column(String, ForeignKey("sermon_series.id"))
    thumbnail   = Column(String)
    video_url   = Column(String)
    has_notes   = Column(Boolean, default=False)
    featured    = Column(Boolean, default=False)

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
    title       = Column(String, nullable=False)
    category    = Column(String)                             # worship | youth | outreach | small-groups
    date        = Column(Date, nullable=False)
    time        = Column(String)                             # "10:00 AM"
    end_time    = Column(String)
    location    = Column(String)
    online      = Column(Boolean, default=False)
    description = Column(Text)
    spots       = Column(Integer, nullable=True)            # None = unlimited

    registrations = relationship("EventRegistration", back_populates="event")


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id         = Column(Integer, primary_key=True, index=True)
    event_id   = Column(Integer, ForeignKey("events.id"))
    name       = Column(String, nullable=False)
    email      = Column(String, nullable=False)
    phone      = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="registrations")


# ─── Blog / Devotionals ─────────────────────────────────────────────────────

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id        = Column(Integer, primary_key=True, index=True)
    category  = Column(String)                               # devotional | teaching | testimony | announcement
    tags      = Column(JSON)                                 # ["faith", "prayer"]
    emoji     = Column(String)
    hero_bg   = Column(String)
    title     = Column(String, nullable=False)
    excerpt   = Column(Text)
    author    = Column(String)
    initials  = Column(String)
    date      = Column(String)                               # human-readable, e.g. "June 2, 2026"
    read_time = Column(String)
    bio_role  = Column(String)
    bio       = Column(Text)
    body      = Column(JSON)                                 # [{type: "p"|"quote", text: "..."}]


# ─── Gallery ────────────────────────────────────────────────────────────────

class GalleryPhoto(Base):
    __tablename__ = "gallery_photos"

    id     = Column(Integer, primary_key=True, index=True)
    album  = Column(String)                                  # Worship | Youth | Outreach 2024 | Community | Missions
    src    = Column(String)                                  # image URL
    alt    = Column(String)
    height = Column(Integer)                                 # display hint


class GalleryVideo(Base):
    __tablename__ = "gallery_videos"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String, nullable=False)
    thumb      = Column(String)
    youtube_id = Column(String, nullable=True)
    date       = Column(String)                              # human-readable


# ─── Contact ────────────────────────────────────────────────────────────────

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, nullable=False)
    phone      = Column(String)
    subject    = Column(String)
    message    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read       = Column(Boolean, default=False)


# ─── About (team members / leadership) ──────────────────────────────────────

class TeamMember(Base):
    __tablename__ = "team_members"

    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String, nullable=False)
    role     = Column(String)
    bio      = Column(Text)
    photo    = Column(String)
    order    = Column(Integer, default=0)                   # display order