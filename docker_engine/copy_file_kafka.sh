#!/bin/bash
# Script untuk copy file ke/dari container Docker

# --- CONFIGURABLE VARIABLE ---
CONTAINER_NAME="kafka-connect"   # Ganti dengan nama container kamu

docker cp ./connect-plugins/bc-fips-2.1.0.jar "$CONTAINER_NAME:/kafka/libs/bc-fips-2.1.0.jar"
docker cp ./connect-plugins/bcpkix-fips-2.1.8.jar "$CONTAINER_NAME:/kafka/libs/bcpkix-fips-2.1.8.jar"
docker cp ./connect-plugins/snowflake-kafka-connector-3.3.0.jar "$CONTAINER_NAME:/kafka/libs/snowflake-kafka-connector-3.3.0.jar"