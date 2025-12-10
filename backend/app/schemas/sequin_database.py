from pydantic import BaseModel, Field
from typing import Optional, List

# Shared properties
class SequinDatabaseBase(BaseModel):
    name: str = Field(..., description="The name of the database resource in Sequin")
    hostname: str = Field(..., description="Database hostname")
    port: int = Field(default=5432, description="Database port")
    database: str = Field(..., description="Postgres database name")
    username: str = Field(..., description="Database username")
    ssl: bool = Field(default=True, description="Enable SSL")
    use_local_tunnel: bool = Field(default=False, description="Use local tunnel")
    ipv6: bool = Field(default=False, description="Use IPv6")
    replication_slots: Optional[List[dict]] = Field(default=None, description="Replication slots configuration")

# Properties to receive on item creation
class SequinDatabaseCreate(SequinDatabaseBase):
    password: str = Field(..., description="Database password")

# Properties to receive on item update (per Sequin API docs)
class SequinDatabaseUpdate(BaseModel):
    name: Optional[str] = None
    hostname: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    replication_slots: Optional[List[dict]] = None

# Properties shared by models stored in DB
class SequinDatabaseInDBBase(SequinDatabaseBase):
    id: str = Field(..., description="Sequin ID")
    
    class Config:
        from_attributes = True

# Properties to return to client
class SequinDatabaseResponse(SequinDatabaseInDBBase):
    replication_slots: Optional[List[dict]] = None
