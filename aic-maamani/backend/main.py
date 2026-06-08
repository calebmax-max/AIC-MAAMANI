from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal
import models  # noqa: F401  Ensures SQLAlchemy models are registered
from admin_auth import router as admin_router
from blog import router as blog_router
from contact import router as contact_router
from events import router as events_router
from gallery import router as gallery_router
from sermons import router as sermons_router
from about import router as about_router
from seed import seed_database

app = FastAPI(
    title="AIC Maamani Church API",
    description="Backend API for AIC Maamani Church website",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # restrict to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    with SessionLocal() as db:
        seed_database(db)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "AIC Maamani Church API is running"}
