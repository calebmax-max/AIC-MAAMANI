from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import sermons, events, blog, gallery, contact, about

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

app.include_router(sermons.router,  prefix="/api/sermons",  tags=["Sermons"])
app.include_router(events.router,   prefix="/api/events",   tags=["Events"])
app.include_router(blog.router,     prefix="/api/blog",     tags=["Blog"])
app.include_router(gallery.router,  prefix="/api/gallery",  tags=["Gallery"])
app.include_router(contact.router,  prefix="/api/contact",  tags=["Contact"])
app.include_router(about.router,    prefix="/api/about",    tags=["About"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "AIC Maamani Church API is running"}