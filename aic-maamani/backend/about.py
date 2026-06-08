from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from admin_auth import require_admin
from database import get_db
from models import TeamMember
from schemas import AboutPageOut, TeamMemberCreate, TeamMemberOut

router = APIRouter()


ABOUT_STORY = {
    "title": "Our Story",
    "body": (
        "AIC Maamani is a church community rooted in grace, truth, and belonging. "
        "We exist to help people encounter Jesus, grow in discipleship, and serve the city with love."
    ),
}

ABOUT_VISION = {
    "title": "Our Vision",
    "body": "A church family where every soul can find hope, healing, and a home in Christ.",
}

ABOUT_MISSION = {
    "title": "Our Mission",
    "body": (
        "To gather, grow, and send people who follow Jesus wholeheartedly through worship, "
        "teaching, fellowship, prayer, and practical service."
    ),
}

TIMELINE = [
    {
        "year": "1998",
        "title": "The Beginning",
        "body": "The church began as a small gathering of believers committed to prayer, Scripture, and mission.",
    },
    {
        "year": "2002",
        "title": "First Building",
        "body": "The congregation moved into its first permanent worship space after years of meeting in rented halls.",
    },
    {
        "year": "2013",
        "title": "Upper Hill Campus",
        "body": "The current sanctuary became a home for growing ministries, worship, and community outreach.",
    },
    {
        "year": "2024",
        "title": "Today",
        "body": "The church continues to grow through discipleship, service, and a heart for the city and beyond.",
    },
]

VALUES = [
    {
        "icon": "Rooted",
        "label": "Rooted in Scripture",
        "body": "Every ministry is anchored in the Bible as our final authority for faith and life.",
    },
    {
        "icon": "Welcome",
        "label": "Radical Hospitality",
        "body": "We want every visitor and member to feel seen, safe, and genuinely welcomed.",
    },
    {
        "icon": "Worship",
        "label": "Spirit-Led Worship",
        "body": "We pursue worship that is honest, Christ-centered, and open to the work of the Spirit.",
    },
    {
        "icon": "Mission",
        "label": "City Transformation",
        "body": "We believe the gospel changes lives, families, neighborhoods, and communities.",
    },
]

BELIEFS = [
    {
        "title": "The Holy Scripture",
        "body": "We believe the Bible is the inspired Word of God and our supreme authority.",
        "ref": "2 Timothy 3:16-17",
    },
    {
        "title": "The Trinity",
        "body": "We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit.",
        "ref": "Matthew 28:19",
    },
    {
        "title": "Salvation by Grace",
        "body": "We believe salvation is a gift of grace received through faith in Jesus Christ alone.",
        "ref": "Ephesians 2:8-9",
    },
]

PASTOR = {
    "name": "Rev. Daniel Mutinda",
    "title": "Senior Pastor",
    "quote": "The church exists for those who are not yet in it. Everything we do should help someone take one step closer to Jesus.",
    "bio": [
        "Rev. Daniel Mutinda serves as the senior pastor and leads the church with a heart for discipleship and the city.",
        "He has spent years building a church culture centered on prayer, Scripture, and practical care for people.",
        "He is married and serves alongside a team of elders, deacons, and ministry leaders.",
    ],
    "credentials": [
        "Bachelor of Theology",
        "Master of Divinity",
        "20+ Years in Ministry",
    ],
}


@router.get("", response_model=AboutPageOut)
def get_about_page(db: Session = Depends(get_db)):
    team = db.query(TeamMember).order_by(TeamMember.order.asc(), TeamMember.id.asc()).all()
    return {
        "story": ABOUT_STORY,
        "vision": ABOUT_VISION,
        "mission": ABOUT_MISSION,
        "timeline": TIMELINE,
        "values": VALUES,
        "beliefs": BELIEFS,
        "pastor": PASTOR,
        "team": team,
    }


@router.get("/team", response_model=list[TeamMemberOut])
def get_team_members(db: Session = Depends(get_db)):
    return db.query(TeamMember).order_by(TeamMember.order.asc(), TeamMember.id.asc()).all()


@router.post("/team", response_model=TeamMemberOut, status_code=201, dependencies=[Depends(require_admin)])
def create_team_member(payload: TeamMemberCreate, db: Session = Depends(get_db)):
    member = TeamMember(**payload.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/team/{member_id}", response_model=TeamMemberOut, dependencies=[Depends(require_admin)])
def update_team_member(member_id: int, payload: TeamMemberCreate, db: Session = Depends(get_db)):
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    for key, value in payload.model_dump().items():
        setattr(member, key, value)

    db.commit()
    db.refresh(member)
    return member


@router.delete("/team/{member_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_team_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    db.delete(member)
    db.commit()
