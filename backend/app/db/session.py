"""Database session handling.

Provides a scoped session that is injected via FastAPI dependencies.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from ..core.config import settings

_database_url = os.environ.get("DATABASE_URL") or os.environ.get("DATABASE_TEST_URL") or settings.DATABASE_URL
engine = create_engine(_database_url, echo=False, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def reinit_engine(database_url=None):
    global engine, SessionLocal
    if database_url is None:
        database_url = os.environ.get("DATABASE_TEST_URL") or settings.DATABASE_URL
    if os.environ.get("PYTEST_CURRENT_TEST") and not os.environ.get("DATABASE_TEST_URL"):
        raise RuntimeError(
            "Tests must run with DATABASE_TEST_URL set. "
            "Example: DATABASE_TEST_URL=postgresql+psycopg2://postgres:postgres@localhost/b2p_test_db pytest"
        )
    engine = create_engine(database_url, echo=False, future=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine
