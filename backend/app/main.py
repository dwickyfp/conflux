from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
# from app.core.database import create_db_and_tables
from app.api.v1.endpoints import settings as settings_router
from app.api.v1.endpoints import sequin as sequin_router
from app.api.v1.endpoints import sequin_databases

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist - direct approach for reliability
    from app.core.database import create_db_and_tables
    create_db_and_tables()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(settings_router.router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])
app.include_router(sequin_router.router, prefix=f"{settings.API_V1_STR}/sequin", tags=["sequin"])
app.include_router(sequin_databases.router, prefix=f"{settings.API_V1_STR}/sequin/databases", tags=["sequin-databases"])

@app.get("/")
def root():
    return {"message": "Welcome to ETL Manager Backend"}
