from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings
from app.models.settings import SystemSettings
from app.models.sequin_database import SequinDatabase

# Use PostgreSQL connection string from settings with connection pool limits
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_size=5,          # Max persistent connections
    max_overflow=10,      # Max additional connections when pool is full
    pool_pre_ping=True,   # Test connections before use
    pool_recycle=3600,    # Recycle connections after 1 hour
)

def create_db_and_tables():
    print(f"Creating tables in database: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
    try:
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")
        raise e

def get_session():
    """
    Dependency that provides a database session.
    Session is automatically committed on success, rolled back on error, and closed.
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

