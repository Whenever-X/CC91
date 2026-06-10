# ============================================
# Stage 1: Build the Spring Boot application
# ============================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for faster build in CI)
RUN mvn package -DskipTests -B

# ============================================
# Stage 2: Runtime image
# ============================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -S cc91 && adduser -S cc91 -G cc91

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R cc91:cc91 /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Use non-root user
USER cc91:cc91

# Environment variables with defaults
ENV SERVER_PORT=8080 \
    DB_URL=jdbc:mysql://mysql:3306/cc91_db?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true \
    DB_USERNAME=root \
    DB_PASSWORD=rootpassword \
    JWT_SECRET=change-me-in-production-use-at-least-256-bits \
    JWT_EXPIRATION=3600000 \
    JWT_REFRESH_EXPIRATION=604800000 \
    CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -s -o /dev/null http://localhost:8080/ || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
