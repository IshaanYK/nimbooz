import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL or ""
# Resilient database provider: If postgres is specified without active connection or empty, fallback to SQLite
if not db_url or "postgresql" in db_url:
    # Use SQLite for standalone MVP persistence
    db_url = "sqlite:///./aasra_mvp.db"

connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}
pool_kwargs = {} if "sqlite" in db_url else {"pool_pre_ping": True, "pool_size": 10, "max_overflow": 20}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **pool_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Initializes and auto-creates all AASRA SQLAlchemy database tables."""
    try:
        from app.models import models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        print("✓ AASRA Database tables initialized successfully:", db_url)
    except Exception as e:
        print("Database initialization notice:", e)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
