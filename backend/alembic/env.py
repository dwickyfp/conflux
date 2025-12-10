import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from sqlmodel import SQLModel

# Import your app's config
from app.core.config import settings
# Import your models so they are registered in SQLModel.metadata
# Note: You might need to import specific model modules here explicitly if they aren't imported by app.models
from app.models.settings import SystemSettings
from app.models.sequin_database import SequinDatabase

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target_metadata is the metadata object needed for autogenerate support
target_metadata = SQLModel.metadata

# Overwrite the sqlalchemy.url in the alembic config with the one from the app settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Using synchronous engine logic for migrations simply to match standard Alembic sync patterns
    # unless async is specifically required. However, if the project is async, we can use async adapter.
    # But usually standard alembic env.py uses standard create_engine.
    # The project uses 'postgresql+psycopg2' (sync) in settings.DATABASE_URL according to previous view_file.
    # But the project deps show 'psycopg2-binary' which is sync.
    # There is no asyncpg in dependencies list in pyproject.toml unless missed.
    # Wait, `sqlmodel` creates engine with `create_engine` in `app/core/database.py`, which is SYNC.
    # So we should use sync engine here.

    from sqlalchemy import create_engine
    
    connectable = create_engine(settings.DATABASE_URL)

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
