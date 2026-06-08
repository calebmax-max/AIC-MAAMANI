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
                src="https://via.placeholder.com/1200x800?text=AIC+Maamani+Gallery",
                alt="Church worship gathering",
                height=800,
            )
        )

    db.commit()

