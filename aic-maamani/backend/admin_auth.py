import os

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import BlogPost, ContactMessage, Event, GalleryPhoto, GalleryVideo, Sermon, TeamMember


router = APIRouter(prefix="/api/admin", tags=["Admin"])


def _admin_password() -> str:
    return os.getenv("ADMIN_PANEL_PASSWORD", "admin123")


def _admin_token() -> str:
    return os.getenv("ADMIN_PANEL_TOKEN", "aic-maamani-admin")


class AdminLoginIn(BaseModel):
    password: str


class AdminLoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminStatsOut(BaseModel):
    sermons: int
    events: int
    posts: int
    photos: int
    videos: int
    messages: int
    team: int


def require_admin(
    authorization: str | None = Header(default=None),
    x_admin_token: str | None = Header(default=None),
) -> None:
    token = None
    if authorization and authorization.lower().startswith("bearer "):
      token = authorization.split(" ", 1)[1].strip()
    elif x_admin_token:
      token = x_admin_token.strip()

    if token != _admin_token():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )


@router.post("/login", response_model=AdminLoginOut)
def login_admin(payload: AdminLoginIn):
    if payload.password != _admin_password():
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return {"access_token": _admin_token(), "token_type": "bearer"}


@router.get("/stats", response_model=AdminStatsOut, dependencies=[Depends(require_admin)])
def get_admin_stats(db: Session = Depends(get_db)):
    return AdminStatsOut(
        sermons=db.query(Sermon).count(),
        events=db.query(Event).count(),
        posts=db.query(BlogPost).count(),
        photos=db.query(GalleryPhoto).count(),
        videos=db.query(GalleryVideo).count(),
        messages=db.query(ContactMessage).count(),
        team=db.query(TeamMember).count(),
    )
