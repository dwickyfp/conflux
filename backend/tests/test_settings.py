from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool
import pytest
from app.main import app
from app.core.database import get_session
# Import models so they are registered with SQLModel.metadata
from app.models.settings import SystemSettings

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

def test_get_settings_default(client):
    response = client.get("/api/v1/settings/")
    assert response.status_code == 200
    data = response.json()
    assert "sequin_url" in data
    assert data["kafka_url"] == "localhost:9092"

def test_update_settings(client):
    new_settings = {
        "sequin_url": "https://newapi.sequin.io",
        "kafka_url": "kafka:9092",
        "sequin_token": "secret_token"
    }
    response = client.post("/api/v1/settings/", json=new_settings)
    assert response.status_code == 200
    data = response.json()
    assert data["sequin_url"] == "https://newapi.sequin.io"
    assert data["sequin_token"] == "secret_token"
    
    # Verify persistence
    response = client.get("/api/v1/settings/")
    assert response.json()["sequin_url"] == "https://newapi.sequin.io"
