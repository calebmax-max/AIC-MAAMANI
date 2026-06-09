import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine, SessionLocal
import models  # noqa: F401  Ensures SQLAlchemy models are registered
from admin_auth import router as admin_router
from blog import router as blog_router
from contact import router as contact_router
from events import router as events_router
from gallery import router as gallery_router
from sermons import router as sermons_router
from about import router as about_router
from migrations import ensure_media_columns
from storage import UPLOADS_DIR, ensure_upload_dirs
from seed import seed_database
from token_auth import verify_token as verify_jwt_token

app = FastAPI(
    title="AIC Maamani Church API",
    description="Backend API for AIC Maamani Church website",
    version="1.0.0",
)

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "AIC_MAAMANI_CORS_ORIGINS",
        "https://aic-maamani-web.onrender.com,https://aic-maamani.vercel.app,http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("AIC_MAAMANI_SESSION_SECRET", "aic-maamani-admin-session-secret"),
    session_cookie="aic_maamani_admin_session",
    same_site=os.getenv("AIC_MAAMANI_SESSION_SAMESITE", "lax"),
    https_only=os.getenv("AIC_MAAMANI_SESSION_SECURE", "false").lower() in {"1", "true", "yes"},
    max_age=int(os.getenv("AIC_MAAMANI_SESSION_MAX_AGE_SECONDS", "28800")),
)

ensure_upload_dirs()
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.include_router(sermons_router,  prefix="/api/sermons",  tags=["Sermons"])
app.include_router(events_router,    prefix="/api/events",   tags=["Events"])
app.include_router(blog_router,      prefix="/api/blog",     tags=["Blog"])
app.include_router(gallery_router,   prefix="/api/gallery",  tags=["Gallery"])
app.include_router(contact_router,   prefix="/api/contact",  tags=["Contact"])
app.include_router(about_router,     prefix="/api/about",    tags=["About"])
app.include_router(admin_router)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_media_columns()
    with SessionLocal() as db:
        seed_database(db)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "AIC Maamani Church API is running"}
