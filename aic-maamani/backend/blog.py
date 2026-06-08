from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from admin_auth import require_admin
from database import get_db
from models import BlogPost
from schemas import BlogPostCreate, BlogPostOut

router = APIRouter()


@router.get("", response_model=List[BlogPostOut])
def get_posts(
    category: Optional[str] = Query(None, description="devotional | teaching | testimony | announcement"),
    tag:      Optional[str] = Query(None, description="Filter by tag (e.g. faith, prayer, community)"),
    skip:  int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(BlogPost)
    if category:
        q = q.filter(BlogPost.category == category)
    posts = q.offset(skip).limit(limit).all()

    if tag:
        # JSON contains — filter in Python since SQLite JSON support is limited
        posts = [p for p in posts if p.tags and tag in p.tags]

    return posts


@router.get("/{post_id}", response_model=BlogPostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=BlogPostOut, status_code=201, dependencies=[Depends(require_admin)])
def create_post(payload: BlogPostCreate, db: Session = Depends(get_db)):
    post = BlogPost(**payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostOut, dependencies=[Depends(require_admin)])
def update_post(post_id: int, payload: BlogPostCreate, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    for key, value in payload.model_dump().items():
        setattr(post, key, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
