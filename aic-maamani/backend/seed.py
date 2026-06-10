from datetime import date

from sqlalchemy.orm import Session

from models import (
    AdminUser,
    BlogPost,
    ContactMessage,
    Event,
    GalleryPhoto,
    Sermon,
    SermonNotes,
    SermonSeries,
    TeamMember,
)


GALLERY_PLACEHOLDER_SRC = (
    "data:image/svg+xml;charset=UTF-8,"
    "%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%221200%22%20height%3D%22800%22%20viewBox%3D%220%200%201200%20800%22%3E"
    "%3Crect%20width%3D%221200%22%20height%3D%22800%22%20fill%3D%22%232C2C2A%22/%3E"
    "%3Crect%20x%3D%2264%22%20y%3D%2264%22%20width%3D%221072%22%20height%3D%22672%22%20fill%3D%22none%22%20stroke%3D%22%23EF9F27%22%20stroke-opacity%3D%220.35%22%20stroke-width%3D%223%22/%3E"
    "%3Ctext%20x%3D%22600%22%20y%3D%22390%22%20fill%3D%22%23F2F1EF%22%20font-family%3D%22Arial%2Csans-serif%22%20font-size%3D%2256%22%20text-anchor%3D%22middle%22%3EAIC%20Maamani%20Gallery%3C/text%3E"
    "%3Ctext%20x%3D%22600%22%20y%3D%22455%22%20fill%3D%22%23EF9F27%22%20font-family%3D%22Arial%2Csans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%3EChurch%20worship%20gathering%3C/text%3E"
    "%3C/svg%3E"
)

def _has_rows(db: Session, model) -> bool:
    return db.query(model).first() is not None


def seed_database(db: Session) -> None:
    if not _has_rows(db, AdminUser):
        from admin_security import create_password_record

        salt, password_hash = create_password_record("admin123")
        db.add(
            AdminUser(
                username="admin",
                password_salt=salt,
                password_hash=password_hash,
                role="full_admin",
                is_active=True,
            )
        )

    if not _has_rows(db, SermonSeries):
        db.add(
            SermonSeries(
                id="the-beatitudes",
                title="The Beatitudes",
                cover_url=None,
                description="A series on the life Jesus describes in Matthew 5.",
                count=1,
            )
        )

    if not _has_rows(db, Sermon):
        sermon = Sermon(
            title="Blessed Are the Hungry",
            speaker="Rev. Daniel Mutinda",
            date=date.today(),
            duration="42 min",
            scripture="Matthew 5:6",
            topic="The Beatitudes",
            series_id="the-beatitudes",
            thumbnail=None,
            video_url=None,
            has_notes=True,
            featured=True,
        )
        db.add(sermon)
        db.flush()
        db.add(
            SermonNotes(
                sermon_id=sermon.id,
                outline=[{"ref": "1", "point": "Hunger for righteousness", "sub": []}],
                key_scriptures=[{"ref": "Matthew 5:6", "text": "Blessed are those who hunger and thirst for righteousness."}],
                sections=[{"heading": "Introduction", "body": "True satisfaction is found in Christ."}],
                reflection_questions=["What are you hungry for?", "How is God shaping your desires?"],
                prayer="Lord, renew our hunger for your kingdom and your righteousness.",
            )
        )

    if not _has_rows(db, Event):
        db.add_all(
            [
                Event(
                    title="Youth Outreach Sunday",
                    category="youth",
                    date=date.today(),
                    time="10:00 AM",
                    end_time="1:00 PM",
                    location="Main Sanctuary",
                    online=False,
                    description="A service led by the youth ministry with worship, testimony, and the Word.",
                    spots=None,
                ),
                Event(
                    title="Prayer and Fasting Weekend",
                    category="worship",
                    date=date.today(),
                    time="6:00 PM",
                    end_time="8:00 PM",
                    location="Church Hall",
                    online=False,
                    description="A time of corporate prayer, fasting, and seeking God together.",
                    spots=None,
                ),
            ]
        )

    if not _has_rows(db, BlogPost):
        db.add(
            BlogPost(
                category="devotional",
                tags=["faith", "prayer"],
                emoji="Morning",
                hero_bg="#FDF3E0",
                title="Finding Peace in the Morning Hour",
                excerpt="A quiet invitation to draw near to God before the noise of the day begins.",
                author="Pastor Grace Wanjiku",
                initials="GW",
                date="June 2, 2026",
                read_time="4 min read",
                bio_role="Lead Women's Pastor",
                bio="Pastor Grace Wanjiku serves in women's ministry and has a heart for contemplative faith.",
                body=[
                    {"type": "p", "text": "The morning holds a particular kind of grace."},
                    {"type": "quote", "text": "\"Be still, and know that I am God.\" - Psalm 46:10"},
                    {"type": "p", "text": "A few minutes of stillness can reorient the whole day."},
                ],
            )
        )

    if not _has_rows(db, TeamMember):
        db.add_all(
            [
                TeamMember(name="Dr. Joyce Kamau", role="Associate Pastor", bio="Pastoral care lead.", photo=None, order=1),
                TeamMember(name="Elder Peter Ndirangu", role="Elder & Treasurer", bio="Governance and finance.", photo=None, order=2),
                TeamMember(name="Pastor Ruth Akinyi", role="Women's Ministry", bio="Leads the women's ministry.", photo=None, order=3),
                TeamMember(name="Deacon Tom Mwangi", role="Worship Director", bio="Leads worship and creative arts.", photo=None, order=4),
            ]
        )

    if not _has_rows(db, GalleryPhoto):
        db.add(
            GalleryPhoto(
                album="Worship",
                src=GALLERY_PLACEHOLDER_SRC,
                alt="Church worship gathering",
                height=800,
            )
        )
    else:
        db.query(GalleryPhoto).filter(GalleryPhoto.src.contains("via.placeholder.com")).update(
            {GalleryPhoto.src: GALLERY_PLACEHOLDER_SRC},
            synchronize_session=False,
        )

    db.commit()

