from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from admin_security import create_password_record, verify_password
from database import get_db
from models import AdminUser, BlogPost, ContactMessage, Event, GalleryPhoto, GalleryVideo, Sermon, TeamMember
from token_auth import create_access_token


router = APIRouter(prefix="/api/admin", tags=["Admin"])

ADMIN_SESSION_KEY = "admin_username"


class AdminLoginIn(BaseModel):
    username: str = Field(min_length=2)
    password: str = Field(min_length=6)


class AdminLoginOut(BaseModel):
    detail: str = "Signed in"
    username: str
    role: str
    token: str | None = None


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


def _admin_username_fallback() -> str:
    return "admin"


def _admin_password_fallback() -> str:
    return "admin123"


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


def require_admin(
    request: Request,
    db: Session = Depends(get_db),
) -> AdminUser:
    # Try Authorization: Bearer <token> first (token-based auth)
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(None, 1)[1]
        try:
            username, role = verify_jwt_token(token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        user = db.query(AdminUser).filter(AdminUser.username == username, AdminUser.is_active.is_(True)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin authentication required",
            )
        return user

    # Fallback to session cookie-based auth
    username = request.session.get(ADMIN_SESSION_KEY)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )

    user = db.query(AdminUser).filter(AdminUser.username == username, AdminUser.is_active.is_(True)).first()
    if not user:
        request.session.clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )
    return user


@router.post("/login", response_model=AdminLoginOut)
def login_admin(payload: AdminLoginIn, request: Request, db: Session = Depends(get_db)):
    _ensure_admin_user(db)
    user = db.query(AdminUser).filter(AdminUser.username == payload.username, AdminUser.is_active.is_(True)).first()
    if not user or not verify_password(payload.password, user.password_salt, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    # Create a JWT access token for token-based auth
    token = create_access_token(user.username, user.role)
    return {
        "detail": "Signed in",
        "username": user.username,
        "role": user.role,
        "token": token,
    }


@router.post("/logout")
def logout_admin(request: Request):
    request.session.clear()
    return {"detail": "Signed out"}


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
