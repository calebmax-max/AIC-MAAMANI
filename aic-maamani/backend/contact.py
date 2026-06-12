from typing import List
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from admin_auth import require_admin
from database import get_db
from models import ContactMessage
from schemas import ContactMessageCreate, ContactMessageOut

router = APIRouter()

VALID_SUBJECTS = {
    "general",
    "prayer-request",
    "pastoral-care",
    "volunteering",
    "events",
    "media",
    "other",
}

PASTOR_EMAIL = "danielmutinda320@gmail.com"
NOTIFY_FROM = os.getenv("NOTIFY_FROM_EMAIL", "")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

SUBJECT_LABELS = {
    "general": "General Enquiry",
    "prayer-request": "Prayer Request",
    "pastoral-care": "Pastoral Care",
    "volunteering": "Volunteering",
    "events": "Events & Programmes",
    "media": "Media",
    "other": "Other",
}

logger = logging.getLogger(__name__)


def _send_notification(msg: "ContactMessage") -> None:
    """Fire-and-forget email to the pastor. Silently logs on failure."""
    if not all([NOTIFY_FROM, SMTP_HOST, SMTP_USER, SMTP_PASS]):
        logger.warning("Email notification skipped - SMTP env vars not configured")
        return

    try:
        subject_label = SUBJECT_LABELS.get(msg.subject, msg.subject)
        is_private = isinstance(msg.message, str) and "[This prayer request is private" in msg.message
        display_message = (
            msg.message.split("\n\n[This prayer request is private")[0]
            if is_private
            else msg.message
        )

        html_body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#2C2C2A;padding:20px 28px;border-bottom:4px solid #EF9F27">
        <h2 style="color:#F2F1EF;margin:0;font-size:20px">New Message - AIC Maamani</h2>
      </div>
      <div style="padding:24px 28px;background:#fff;border:1px solid #E0DDD8">
        {'<div style="background:#FEF3D9;border:1px solid #F5D88A;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#BA7517;font-weight:600;">Private prayer request - handle with care</div>' if is_private else ''}
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
          <tr><td style="padding:6px 0;color:#5F5E5A;width:120px">From</td><td style="padding:6px 0;font-weight:600">{msg.name or 'Anonymous'}</td></tr>
          <tr><td style="padding:6px 0;color:#5F5E5A">Phone</td><td style="padding:6px 0">{msg.phone or '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#5F5E5A">Subject</td><td style="padding:6px 0">{subject_label}</td></tr>
        </table>
        <div style="background:#F2F1EF;padding:16px 18px;border-left:4px solid #EF9F27;font-size:14px;line-height:1.8;white-space:pre-wrap">{display_message}</div>
        <p style="margin-top:24px;font-size:13px;color:#5F5E5A">
          Log in to the admin panel to reply or mark as read.
        </p>
      </div>
      <div style="padding:12px 28px;background:#F2F1EF;font-size:11px;color:#9E9D99">
        AIC Maamani · Mombasa Road, Nairobi
      </div>
    </div>
    """

        mime_email = MIMEMultipart("alternative")
        mime_email["Subject"] = f"[AIC Maamani] New {subject_label}{' (Private)' if is_private else ''}"
        mime_email["From"] = NOTIFY_FROM
        mime_email["To"] = PASTOR_EMAIL
        mime_email.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(NOTIFY_FROM, PASTOR_EMAIL, mime_email.as_string())
        logger.info("Notification email sent for contact message id=%s", msg.id)
    except Exception as exc:
        logger.error("Failed to send notification email: %s", exc)


@router.post("", response_model=ContactMessageOut, status_code=201)
def submit_message(payload: ContactMessageCreate, db: Session = Depends(get_db)):
    if payload.subject not in VALID_SUBJECTS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid subject. Choose from: {', '.join(sorted(VALID_SUBJECTS))}",
        )
    if payload.subject == "prayer-request" and not payload.phone:
        raise HTTPException(status_code=422, detail="Phone number is required for prayer requests.")
    if payload.subject != "prayer-request" and not payload.phone and not payload.email:
        raise HTTPException(status_code=422, detail="Either email or phone number is required.")
    msg = ContactMessage(**payload.model_dump())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    _send_notification(msg)
    return msg


@router.get("", response_model=List[ContactMessageOut], dependencies=[Depends(require_admin)])
def get_messages(unread_only: bool = False, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    q = db.query(ContactMessage)
    if unread_only:
        q = q.filter(ContactMessage.read == False)
    return q.order_by(ContactMessage.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/{message_id}/read", response_model=ContactMessageOut, dependencies=[Depends(require_admin)])
def mark_as_read(message_id: int, db: Session = Depends(get_db)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.read = True
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{message_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_message(message_id: int, db: Session = Depends(get_db)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()