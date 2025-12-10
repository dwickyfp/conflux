# Running the Backend

This guide explains how to set up and run the ETL Manager backend locally.

## Prerequisites

- **Python 3.12+**
- **uv**: Our package manager. Install it via `curl -LsSf https://astral.sh/uv/install.sh | sh` (or brew).
- **PostgreSQL**: A running instance of Postgres.

## Setup

1.  **Configure Environment**:
    We have provided a `.env` file with default settings. Ensure these match your local Postgres:
    ```env
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_SERVER=localhost
    POSTGRES_PORT=5432
    POSTGRES_DB=etl_manager
    ```

2.  **Install Dependencies**:
    Sync the environment using `uv`:
    ```bash
    uv sync / uv sync --native-tls
    ```

## Running the Server

Start the development server with:
```bash
uv run fastapi dev app/main.py
```

- The API will be available at `http://127.0.0.1:8000`.
- API Docs are at `http://127.0.0.1:8000/docs`.

## Database Tables

The application automatically checks for tables on startup and creates them if they don't exist.
When you run the app, watch the console for:
`Creating tables in database: ...`
`Tables created successfully.`
