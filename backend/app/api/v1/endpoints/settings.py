from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.settings import SystemSettings
from app.services.sequin import SequinService

router = APIRouter()

@router.get("/", response_model=SystemSettings)
def get_settings(session: Session = Depends(get_session)):
    settings = session.exec(select(SystemSettings)).first()
    if not settings:
        # Return default if not exists
        return SystemSettings()
    return settings

@router.post("/", response_model=SystemSettings)
def update_settings(settings_in: SystemSettings, session: Session = Depends(get_session)):
    settings = session.exec(select(SystemSettings)).first()
    if not settings:
        settings = SystemSettings(**settings_in.model_dump())
        session.add(settings)
    else:
        settings.sqlmodel_update(settings_in.model_dump(exclude_unset=True))
        session.add(settings)
    
    session.commit()
    session.refresh(settings)
    return settings

@router.post("/test-connection")
async def test_connection(session: Session = Depends(get_session)):
    service = SequinService(session)
    is_connected = await service.test_connection()
    return {"connected": is_connected}
