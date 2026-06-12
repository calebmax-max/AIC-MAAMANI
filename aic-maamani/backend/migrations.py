from __future__ import annotations

from sqlalchemy import inspect, text

from database import engine


def _existing_columns(table_name: str) -> set[str]:
    inspector = inspect(engine)
    return {column["name"] for column in inspector.get_columns(table_name)}


def ensure_media_columns() -> None:
    if engine.dialect.name not in {"sqlite", "mysql", "postgresql"}:
        return

    required: list[tuple[str, str, str]] = []

    admin_columns = _existing_columns("admin_users")
    if "messages_pin_salt" not in admin_columns:
        required.append(("admin_users", "messages_pin_salt", "TEXT"))
    if "messages_pin_hash" not in admin_columns:
        required.append(("admin_users", "messages_pin_hash", "TEXT"))

    sermons_columns = _existing_columns("sermons")
    if "audio_url" not in sermons_columns:
        required.append(("sermons", "audio_url", "TEXT"))
    if "document_url" not in sermons_columns:
        required.append(("sermons", "document_url", "TEXT"))
    if "document_text" not in sermons_columns:
        required.append(("sermons", "document_text", "TEXT"))

    gallery_video_columns = _existing_columns("gallery_videos")
    if "video_url" not in gallery_video_columns:
        required.append(("gallery_videos", "video_url", "TEXT"))

    contact_columns = _existing_columns("contact_messages")
    if "phone" not in contact_columns:
        required.append(("contact_messages", "phone", "VARCHAR(255)"))

    if not required:
        return

    with engine.begin() as conn:
        for table_name, column_name, column_type in required:
            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))