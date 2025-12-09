import httpx
from sqlmodel import Session, select
from app.models.settings import SystemSettings
from fastapi import HTTPException

class SequinService:
    def __init__(self, session: Session):
        self.session = session
        self.settings = self._get_settings()

    def _get_settings(self) -> SystemSettings:
        settings = self.session.exec(select(SystemSettings)).first()
        if not settings:
            raise HTTPException(status_code=400, detail="System settings not configured")
        return settings

    def _get_headers(self):
        if not self.settings.sequin_token:
            raise HTTPException(status_code=400, detail="Sequin token not configured")
        return {
            "Authorization": f"Bearer {self.settings.sequin_token}",
            "Content-Type": "application/json"
        }

    def _get_url(self, path: str):
        base = self.settings.sequin_url.rstrip("/")
        return f"{base}{path}"

    async def test_connection(self):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self._get_url("/api/postgres_databases"),
                    headers=self._get_headers(),
                    timeout=5.0
                )
                response.raise_for_status()
                return True
        except Exception as e:
            print(f"Sequin Connection Error: {e}")
            return False

    async def list_databases(self):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self._get_url("/api/postgres_databases"),
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()

    async def list_sinks(self):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self._get_url("/api/sinks"),
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()

    async def create_sink(self, sink_data: dict):
        # Logic to create sink
        # Note: The user requirement mentions creating Kafka topics if they don't exist.
        # This service might need to call a KafkaService here or the caller should do it.
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self._get_url("/api/sinks"),
                headers=self._get_headers(),
                json=sink_data
            )
            response.raise_for_status()
            return response.json()

    async def create_backfill(self, sink_id_or_name: str, backfill_data: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self._get_url(f"/api/sinks/{sink_id_or_name}/backfills"),
                headers=self._get_headers(),
                json=backfill_data
            )
            response.raise_for_status()
            return response.json()
