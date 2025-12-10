from alembic.config import Config
from alembic import command
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

def run_pending_migrations() -> None:
    """
    Run pending migrations at startup.
    Optimized: skips if already at head, reuses existing engine.
    """
    from app.core.database import engine  # Reuse existing engine
    
    alembic_cfg = Config("alembic.ini")
    
    with engine.connect() as connection:
        # Check current revision
        context = MigrationContext.configure(connection)
        current_rev = context.get_current_revision()
        
        # Get head revision
        script = ScriptDirectory.from_config(alembic_cfg)
        head_rev = script.get_current_head()
        
        if current_rev == head_rev:
            logger.info("Database already at head. Skipping migrations.")
            return
        
        if current_rev is None:
            # Check if tables exist (legacy DB without alembic_version)
            result = connection.execute(
                text("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name != 'alembic_version'")
            ).scalar()
            if result and result > 0:
                # Legacy DB: stamp as head (tables exist)
                logger.warning("Existing tables found without migration history. Stamping head.")
                command.stamp(alembic_cfg, "head")
                return
            # Fresh DB: fall through to run upgrade
    
    # Run pending migrations (creates tables for fresh DB)
    try:
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully.")
    except Exception as e:
        logger.error(f"Error running migrations: {e}")
        raise
