"""Initial migration

Revision ID: initial_rev
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlmodel import SQLModel
from app.models.settings import SystemSettings
from app.models.sequin_database import SequinDatabase


# revision identifiers, used by Alembic.
revision: str = 'initial_rev'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create all tables from SQLModel metadata
    bind = op.get_bind()
    SQLModel.metadata.create_all(bind)


def downgrade() -> None:
    # Dropping all tables is risky, maybe just pass or drop specific ones if known.
    # For initial migration downgrade, usually we drop everything created.
    # SQLModel.metadata.drop_all(op.get_bind())
    pass
