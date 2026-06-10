import os
import logging
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent / ".env")

logger = logging.getLogger(__name__)


def _build_database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if url:
        if url.startswith("postgres://"):
            return "postgresql://" + url.removeprefix("postgres://")
        return url

    if any(
        os.getenv(name)
        for name in ("MYSQL_HOST", "MYSQL_PORT", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE")
    ):
        host = os.getenv("MYSQL_HOST", "127.0.0.1")
        port = os.getenv("MYSQL_PORT", "3306")
        user = os.getenv("MYSQL_USER", "root")
        password = os.getenv("MYSQL_PASSWORD", "")
        database = os.getenv("MYSQL_DATABASE", "aic_maamani")

        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

    return "sqlite:///./aic_maamani.db"


DATABASE_URL = _build_database_url()


def _engine_kwargs(url: str) -> dict:
    kwargs = {"pool_pre_ping": True}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    return kwargs


def _build_engine(url: str):
    return create_engine(url, **_engine_kwargs(url))


engine = _build_engine(DATABASE_URL)

if not DATABASE_URL.startswith("sqlite"):
    strict_db = os.getenv("AIC_MAAMANI_STRICT_DB", "").lower() in {"1", "true", "yes"}
    try:
        with engine.connect():
            pass
    except SQLAlchemyError as exc:
        if strict_db:
            raise
        logger.warning(
            "Falling back to local SQLite database because the configured DB is unreachable: %s",
            exc,
        )
        DATABASE_URL = "sqlite:///./aic_maamani.db"
        engine = _build_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
