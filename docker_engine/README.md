# Real-Time Data Pipeline: PostgreSQL to Snowflake using Kafka

This project demonstrates how to build a real-time data pipeline that streams data from PostgreSQL to Snowflake using Apache Kafka as the messaging backbone. The pipeline enables near real-time data replication and analytics capabilities.

## Architecture Overview

```
PostgreSQL -> Kafka Connect (Source) -> Kafka -> Kafka Connect (Sink) -> Snowflake
```

## Prerequisites

- Docker and Docker Compose
- Python 3.7+
- PostgreSQL database
- Snowflake account
- Kafka Connect with required connectors

## Components

1. **PostgreSQL**: Source database where the data originates
2. **Apache Kafka**: Distributed streaming platform
3. **Kafka Connect**: Framework for streaming data between Kafka and other systems
4. **Snowflake**: Cloud data warehouse destination

## Quick Start

1. Clone this repository
2. Set up your environment variables
3. Start the services using Docker Compose:
   ```bash
   docker compose up -d
   ```
4. Configure Kafka Connect:
   ```bash
   cd create_connector
   python push_kafka_connect.py
   ```

## Configuration

The project includes several important configuration files:

- `docker-compose.yml`: Defines the required services
- `create_connector/config.json`: Kafka Connect configuration
- `prometheus.yml`: Monitoring configuration
- `grafana_dashboard.yml`: Dashboard configuration

## Monitoring

The pipeline includes monitoring capabilities using:
- Prometheus for metrics collection
- Grafana for visualization

## Security

Security features implemented:
- RSA key authentication for Snowflake
- FIPS compliance with custom security modules

## Directory Structure

- `connect-plugins/`: Contains required Kafka connector JARs
- `create_connector/`: Connector configuration and setup scripts
- `seed_data/`: Test data and seeding scripts
- `user/`: Security keys and certificates

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
