from sqlmodel import SQLModel, Field
from typing import Optional

class SystemSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sequin_url: str = Field(default="https://api.sequinstream.com")
    sequin_token: Optional[str] = None
    kafka_url: str = Field(default="localhost:9092")
    
    # Store health status for quick access
    sequin_reachable: bool = False
    kafka_reachable: bool = False
