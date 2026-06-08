import os
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from admin_security import create_password_record, make_token, parse_token, verify_password
from database import get_db
from models import AdminUser, BlogPost, ContactMessage, Event, GalleryPhoto, GalleryVideo, Sermon, TeamMember


router = APIRouter(prefix="/api/admin", tags=["Admin"])


class AdminLoginIn(BaseModel):
    username: str = Field(min_length=2)
    password: str = Field(min_length=6)


class AdminLoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str


class AdminCurrentOut(BaseModel):
    username: str
    role: str


class AdminPasswordChangeIn(BaseModel):
    current_password: str = Field(min_length=6)
    new_password: str = Field(min_length=6)


class AdminStatsOut(BaseModel):
    sermons: int
    events: int
    posts: int
    photos: int
    videos: int
    messages: int
    team: int


def _admin_token_secret() -> str:
    return os.getenv("ADMIN_PANEL_TOKEN_SECRET", "aic-maamani-admin-secret")


def _admin_username_fallback() -> str:
    return os.getenv("ADMIN_PANEL_USERNAME", "admin")


def _admin_password_fallback() -> str:
    return os.getenv("ADMIN_PANEL_PASSWORD", "admin123")


def _ensure_admin_user(db: Session) -> AdminUser:
    user = db.query(AdminUser).filter(AdminUser.username == _admin_username_fallback()).first()
    if user:
        return user

    salt, password_hash = create_password_record(_admin_password_fallback())
    user = AdminUser(
        username=_admin_username_fallback(),
        password_salt=salt,
        password_hash=password_hash,
        role="full_admin",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _get_admin_from_token(token: str, db: Session) -> AdminUser:
    username = parse_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )

    user = db.query(AdminUser).filter(AdminUser.username == username, AdminUser.is_active.is_(True)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )
    return user


def require_admin(
    authorization: str | None = Header(default=None),
    x_admin_token: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> AdminUser:
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif x_admin_token:
        token = x_admin_token.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )

    return _get_admin_from_token(token, db)


@router.post("/login", response_model=AdminLoginOut)
def login_admin(payload: AdminLoginIn, db: Session = Depends(get_db)):
    _ensure_admin_user(db)
    user = db.query(AdminUser).filter(AdminUser.username == payload.username, AdminUser.is_active.is_(True)).first()
    if not user or not verify_password(payload.password, user.password_salt, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {
        "access_token": make_token(user.username),
        "token_type": "bearer",
        "username": user.username,
        "role": user.role,
    }


@router.get("/me", response_model=AdminCurrentOut)
def get_current_admin(current_admin: AdminUser = Depends(require_admin)):
    return {"username": current_admin.username, "role": current_admin.role}


@router.put("/password")
def change_password(
    payload: AdminPasswordChangeIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_admin),
):
    if not verify_password(payload.current_password, current_admin.password_salt, current_admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    salt, password_hash = create_password_record(payload.new_password)
    current_admin.password_salt = salt
    current_admin.password_hash = password_hash
    db.add(current_admin)
    db.commit()
    return {"detail": "Password updated successfully"}


@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(db: Session = Depends(get_db), _: AdminUser = Depends(require_admin)):
    return AdminStatsOut(
        sermons=db.query(Sermon).count(),
        events=db.query(Event).count(),
        posts=db.query(BlogPost).count(),
        photos=db.query(GalleryPhoto).count(),
        videos=db.query(GalleryVideo).count(),
        messages=db.query(ContactMessage).count(),
        team=db.query(TeamMember).count(),
    )
