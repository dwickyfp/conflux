from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Use PostgreSQL connection string from settings
engine = create_engine(settings.DATABASE_URL, echo=True)

def create_db_and_tables():
    print(f"Creating tables in database: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
    try:
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")
        raise e

def get_session():
    with Session(engine) as session:
        yield session
