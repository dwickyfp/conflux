from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from sqlmodel import Session

from app.core.database import get_session
from app.services.sequin import SequinService
from app.schemas.sequin_database import SequinDatabaseCreate, SequinDatabaseUpdate

router = APIRouter()

@router.get("/", status_code=200)
async def list_databases(
    session: Session = Depends(get_session),
) -> Any:
    """
    List all databases from Sequin and sync with local storage.
    """
    service = SequinService(session)
    return await service.list_databases()

@router.post("/", status_code=201)
async def create_database(
    *,
    session: Session = Depends(get_session),
    database_in: SequinDatabaseCreate,
) -> Any:
    """
    Create a new database in Sequin.
    """
    service = SequinService(session)
    # Pydantic to dict
    try:
        return await service.create_database(database_in.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{database_id}")
async def get_database(
    *,
    session: Session = Depends(get_session),
    database_id: str,
) -> Any:
    """
    Get a specific database by ID or name from Sequin.
    """
    service = SequinService(session)
    return await service.get_database(database_id)

@router.put("/{database_id}")
async def update_database(
    *,
    session: Session = Depends(get_session),
    database_id: str,
    database_in: SequinDatabaseUpdate,
) -> Any:
    """
    Update a database.
    """
    service = SequinService(session)
    # filter out None values
    update_data = database_in.model_dump(exclude_unset=True)
    return await service.update_database(database_id, update_data)

@router.delete("/{database_id}")
async def delete_database(
    *,
    session: Session = Depends(get_session),
    database_id: str,
) -> Any:
    """
    Delete a database.
    """
    service = SequinService(session)
    return await service.delete_database(database_id)

@router.post("/test-connection")
async def test_connection(
    *,
    session: Session = Depends(get_session),
    database_in: SequinDatabaseCreate = None, # Optional payload to test specific config
) -> Any:
    """
    Test connection to a database.
    """
    service = SequinService(session)
    data = database_in.model_dump() if database_in else {}
    return await service.test_connection_db(data)

@router.post("/{database_id}/refresh-tables")
async def refresh_tables(
    *,
    session: Session = Depends(get_session),
    database_id: str,
) -> Any:
    """
    Refresh tables for a database.
    """
    service = SequinService(session)
    return await service.refresh_tables(database_id)
