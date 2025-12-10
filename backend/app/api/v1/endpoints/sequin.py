from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from app.services.sequin import SequinService
from typing import Any, Dict

router = APIRouter()

@router.get("/databases")
async def list_databases(session: Session = Depends(get_session)):
    service = SequinService(session)
    return await service.list_databases()

@router.get("/sinks")
async def list_sinks(session: Session = Depends(get_session)):
    service = SequinService(session)
    return await service.list_sinks()

@router.post("/sinks")
async def create_sink(sink_data: Dict[str, Any], session: Session = Depends(get_session)):
    service = SequinService(session)
    return await service.create_sink(sink_data)

@router.post("/sinks/{sink_id}/backfills")
async def create_backfill(sink_id: str, backfill_data: Dict[str, Any], session: Session = Depends(get_session)):
    service = SequinService(session)
    return await service.create_backfill(sink_id, backfill_data)
