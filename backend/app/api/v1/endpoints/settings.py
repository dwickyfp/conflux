from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.settings import SystemSettings
from app.services.sequin import SequinService
from kafka import KafkaProducer     # type: ignore
from kafka.errors import KafkaError # type: ignore
from datetime import datetime, timezone

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
    return {
        "connected": is_connected,
        "checked_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/test-kafka")
def test_kafka_connection(session: Session = Depends(get_session)):
    """
    Test connectivity to Kafka using kafka-python with multiple checks.
    """
    from kafka import KafkaConsumer, KafkaAdminClient # type: ignore
    
    settings = session.exec(select(SystemSettings)).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    bootstrap_servers = settings.kafka_url
    details = []
    
    # Test 1: Try connecting with KafkaAdminClient
    try:
        admin_client = KafkaAdminClient(
            bootstrap_servers=bootstrap_servers,
            client_id="connection-test",
            request_timeout_ms=5000,
        )
        cluster_metadata = admin_client.describe_cluster()
        details.append(f"AdminClient connected. Cluster ID: {cluster_metadata.get('cluster_id', 'N/A')}")
        admin_client.close()
    except Exception as e:
        return {
            "connected": False, 
            "error": f"AdminClient connection failed: {str(e)}",
            "checked_at": datetime.now(timezone.utc).isoformat()
        }

    # Test 2: Try creating a producer
    try:
        producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            request_timeout_ms=5000,
            max_block_ms=5000,
        )
        metadata = producer.bootstrap_connected()
        details.append(f"Producer connected. Bootstrap connected: {metadata}")
        producer.close()
    except Exception as e:
         return {
            "connected": False, 
            "error": f"Producer connection failed: {str(e)}",
            "checked_at": datetime.now(timezone.utc).isoformat()
        }

    # Test 3: Try creating a consumer
    try:
        consumer = KafkaConsumer(
            bootstrap_servers=bootstrap_servers,
            request_timeout_ms=5000,
            consumer_timeout_ms=1000,
        )
        topics = consumer.topics() # Get topics to verify connectivity
        details.append(f"Consumer connected. Topics visible.")
        consumer.close()
    except Exception as e:
         return {
            "connected": False, 
            "error": f"Consumer connection failed: {str(e)}",
            "checked_at": datetime.now(timezone.utc).isoformat()
        }

    return {
        "connected": True,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "details": details
    }
