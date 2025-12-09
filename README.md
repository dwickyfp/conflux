# Conflux

**A unified real-time data orchestration platform connecting Postgres, Kafka, RisingWave, and Snowflake. Seamless CDC pipelines powered by Sequin.**

Conflux simplifies the complexity of building real-time data pipelines. It provides an admin dashboard to manage and monitor your Change Data Capture (CDC) flows, ensuring data consistency and low latency across your data infrastructure.

## Features

- **Real-time Data Orchestration**: seamlessly connect Postgres to Kafka, Snowflake, and more.
- **CDC Pipelines**: Powered by Sequin for reliable change data capture.
- **Unified Dashboard**: Manage your streams, connectors, and schemas in one place.
- **Observability**: Built-in monitoring with Grafana and Prometheus.
- **Modern UI**: Dark/Light mode, responsive design, and accessible components.

## Tech Stack

Conflux is built with a modern stack emphasizing performance and type safety.

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Routing**: [TanStack Router](https://tanstack.com/router/latest)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Package Manager**: [uv](https://github.com/astral-sh/uv)

### Infrastructure (Docker)
- **Kafka**: KRaft mode (no ZooKeeper)
- **Sequin**: CDC engine
- **Redis**: Caching and Sequin state
- **Postgres**: Application DB and Source DB
- **Grafana & Prometheus**: Monitoring

## Getting Started

Follow these steps to set up Conflux locally.

### Prerequisites
- Node.js & pnpm
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/conflux.git
   cd conflux
   ```

2. **Start Infrastructure**
   Spin up Kafka, Sequin, and other services.
   ```bash
   cd docker_engine
   docker compose up -d
   cd ..
   ```

3. **Install Frontend Dependencies**
   ```bash
   pnpm install
   ```

4. **Start Development Server**
   ```bash
   pnpm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Architecture

The `docker_engine` folder contains the definition for the following services:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Kafka** | `9092` | Event streaming platform (KRaft mode). |
| **Kafka UI** | `9080` | Web UI for managing Kafka clusters. |
| **Sequin** | `7376` | CDC orchestration engine. |
| **Sequin Postgres** | `7377` | Internal database for Sequin. |
| **Sequin Redis** | `7378` | internal Redis for Sequin. |
| **Grafana** | `3000` | metrics visualization. |

## License

Licensed under the [MIT License](LICENSE).
