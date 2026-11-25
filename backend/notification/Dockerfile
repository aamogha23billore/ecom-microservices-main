FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/notification-0.0.1-SNAPSHOT.jar app.jar

# Kafka consumer; no HTTP listener is required.
ENTRYPOINT ["java", "-jar", "app.jar"]
