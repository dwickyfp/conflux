from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select, delete
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import get_session
from app.models.settings import SystemSettings
from unittest.mock import patch, AsyncMock
import pytest

# Setup in-memory DB for tests
engine = create_engine(
    "sqlite:///:memory:", 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)
SQLModel.metadata.create_all(engine)

@pytest.fixture(name="client")
def client_fixture():
    def get_session_override():
        with Session(engine) as session:
            yield session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def setup_settings(session: Session):
    settings = SystemSettings(sequin_url="https://mock.sequin.io", sequin_token="test-token", kafka_url="kafka:9092")
    session.add(settings)
    session.commit()

@patch("httpx.AsyncClient.get")
def test_list_databases(mock_get, client):
    # Setup DB state
    with Session(engine) as session:
        # Clear existing
        session.exec(delete(SystemSettings))
        session.commit()
        # setup
        setup_settings(session)
    
    # Mock Sequin API response
    mock_get.return_value = AsyncMock(
        status_code=200,
        raise_for_status=lambda: None,
        json=lambda: [{"id": "db_1", "name": "test-db"}]
    )

    response = client.get("/api/v1/sequin/databases")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "test-db"
    
    # Verify mock call
    mock_get.assert_called()

@patch("httpx.AsyncClient.get")
def test_list_sinks(mock_get, client):
    with Session(engine) as session:
         setup_settings(session)

    mock_get.return_value = AsyncMock(
        status_code=200,
        raise_for_status=lambda: None,
        json=lambda: [{"id": "sink_1", "name": "sink-consumer"}]
    )

    response = client.get("/api/v1/sequin/sinks")
    assert response.status_code == 200
    assert response.json()[0]["name"] == "sink-consumer"
