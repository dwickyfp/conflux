from sqlmodel import SQLModel, Field, JSON, Column
from typing import Optional, List

class SequinDatabase(SQLModel, table=True):
    id: str = Field(primary_key=True, description="Sequin ID (e.g. db_...)")
    name: str
    hostname: str
    port: int
    database: str
    username: str
    password: Optional[str] = None # Storing sensitive data locally? If needed for manage, yes.
    ssl: bool = True
    use_local_tunnel: bool = False
    ipv6: bool = False
    replication_slots: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
