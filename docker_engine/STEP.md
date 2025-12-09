## Generate RSA

# Encrypted private key (recommended)
openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 aes256 -inform PEM -out rsa_key.p8

# Or unencrypted (dev-only)
# openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out rsa_key.p8 -nocrypt

# Public key from the private key
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub

# Download Jar Kafka Connect
https://mvnrepository.com/artifact/org.bouncycastle/bc-fips/2.1.0
https://mvnrepository.com/artifact/org.bouncycastle/bcpkix-fips/2.1.8
https://mvnrepository.com/artifact/com.snowflake/snowflake-kafka-connector/3.3.0

