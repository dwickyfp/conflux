import httpx
import logging
from sqlmodel import Session, select
from app.models.settings import SystemSettings
from fastapi import HTTPException

logger = logging.getLogger(__name__)


class SequinService:
    """
    Service for interacting with Sequin API.
    All data is fetched directly from Sequin API - no local DB storage.
    """
    
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
        """Test connection to Sequin API."""
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
            logger.error(f"Sequin Connection Error: {e}")
            return False

    async def list_databases(self):
        """
        List all databases from Sequin API.
        Returns realtime data directly from Sequin.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self._get_url("/api/postgres_databases?show_sensitive=true"),
                    headers=self._get_headers()
                )
                response.raise_for_status()
                data = response.json()
                logger.debug(f"Sequin List Response: {data}")
                print(f"Sequin List Response: {data}")
                return data  # Returns {"data": [...]}
            except httpx.HTTPStatusError as e:
                logger.error(f"Sequin API Error: {e.response.text}")
                raise HTTPException(status_code=e.response.status_code, detail=f"Sequin Error: {e.response.text}")
            except Exception as e:
                logger.error(f"Error fetching from Sequin: {e}")
                raise HTTPException(status_code=500, detail=str(e))

    async def get_database(self, id_or_name: str):
        """
        Get a specific database by ID or name from Sequin API.
        Returns realtime data directly from Sequin.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self._get_url(f"/api/postgres_databases/{id_or_name}"),
                    headers=self._get_headers()
                )
                response.raise_for_status()
                data = response.json()
                logger.debug(f"Sequin Get Response: {data}")
                return data  # Returns {"data": {...}}
            except httpx.HTTPStatusError as e:
                logger.error(f"Sequin API Error: {e.response.text}")
                raise HTTPException(status_code=e.response.status_code, detail=f"Sequin Error: {e.response.text}")

    async def create_database(self, database_in: dict):
        """
        Create a new database in Sequin.
        Returns the created database from Sequin API response.
        """
        async with httpx.AsyncClient() as client:
            try:
                logger.info(f"Creating database with payload: {database_in}")
                response = await client.post(
                    self._get_url("/api/postgres_databases"),
                    headers=self._get_headers(),
                    json=database_in
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Sequin Create Response: {data}")
                
                # Extract the data object if wrapped
                if "data" in data:
                    return data["data"]
                return data
            except httpx.HTTPStatusError as e:
                logger.error(f"Sequin API Error: {e.response.text}")
                raise HTTPException(status_code=e.response.status_code, detail=f"Sequin Error: {e.response.text}")

    async def update_database(self, id_or_name: str, database_in: dict):
        """
        Update a database in Sequin.
        Uses the database name in the URL as per Sequin API docs.
        """
        async with httpx.AsyncClient() as client:
            try:
                logger.info(f"Updating database {id_or_name} with payload: {database_in}")
                response = await client.put(
                    self._get_url(f"/api/postgres_databases/{id_or_name}"),
                    headers=self._get_headers(),
                    json=database_in
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Sequin Update Response: {data}")
                
                if "data" in data:
                    return data["data"]
                return data
            except httpx.HTTPStatusError as e:
                logger.error(f"Sequin API Error: {e.response.text}")
                raise HTTPException(status_code=e.response.status_code, detail=f"Sequin Error: {e.response.text}")

    async def delete_database(self, id_or_name: str):
        """Delete a database from Sequin."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.delete(
                    self._get_url(f"/api/postgres_databases/{id_or_name}"),
                    headers=self._get_headers()
                )
                response.raise_for_status()
                logger.info(f"Deleted database: {id_or_name}")
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Sequin API Error: {e.response.text}")
                raise HTTPException(status_code=e.response.status_code, detail=f"Sequin Error: {e.response.text}")
            
    async def test_connection_db(self, database_payload: dict = None):
        """Test connection to a specific database configuration."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self._get_url("/api/postgres_databases/test_connection"),
                    headers=self._get_headers(),
                    json=database_payload or {}
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Sequin API Error: {e.response.text}")
                raise HTTPException(status_code=e.response.status_code, detail=f"Sequin Error: {e.response.text}")
            
    async def refresh_tables(self, database_id: str):
        """Refresh tables for a database."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self._get_url(f"/api/postgres_databases/{database_id}/refresh_tables"),
                    headers=self._get_headers()
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Sequin API Error: {e.response.text}")
                raise HTTPException(status_code=e.response.status_code, detail=f"Sequin Error: {e.response.text}")

    async def list_sinks(self):
        """List all sinks from Sequin."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self._get_url("/api/sinks"),
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()

    async def create_sink(self, sink_data: dict):
        """Create a new sink in Sequin."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self._get_url("/api/sinks"),
                headers=self._get_headers(),
                json=sink_data
            )
            response.raise_for_status()
            return response.json()

    async def create_backfill(self, sink_id_or_name: str, backfill_data: dict):
        """Create a backfill for a sink."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self._get_url(f"/api/sinks/{sink_id_or_name}/backfills"),
                headers=self._get_headers(),
                json=backfill_data
            )
            response.raise_for_status()
            return response.json()
