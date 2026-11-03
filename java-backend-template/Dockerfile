# syntax=docker/dockerfile:1
# Dockerfile multi-stage: lo stage "build" compila con il JDK completo, lo stage finale contiene solo
# il JRE e l'applicazione (immagine più piccola, senza compilatore né Maven).

# ---- Stage 1: build ---------------------------------------------------------------------------
FROM eclipse-temurin:25.0.5_8-jdk-alpine AS build
WORKDIR /workspace

# 1) Prima solo i file che descrivono le dipendenze: finché pom.xml non cambia, Docker riusa questo layer
#    e non riscarica le dipendenze. La cache mount di BuildKit conserva ~/.m2 anche tra build diverse.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    chmod +x mvnw && ./mvnw -B -q dependency:go-offline

# 2) Poi il codice sorgente: modificarlo invalida solo i layer da qui in giù.
COPY src/ src/
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -q -DskipTests package \
    && cp target/*.jar application.jar \
    # Estrae il jar in layer (dipendenze, loader, applicazione) per sfruttare la cache di Docker.
    && java -Djarmode=tools -jar application.jar extract --layers --launcher --destination extracted

# ---- Stage 2: runtime -------------------------------------------------------------------------
FROM eclipse-temurin:25.0.5_8-jre-alpine AS runtime
WORKDIR /app

# Utente non-root: se l'applicazione venisse compromessa, non avrebbe i privilegi di root nel container.
RUN addgroup -S app && adduser -S -G app app

# Dalla meno alla più soggetta a cambiamenti: le dipendenze restano in cache tra un rilascio e l'altro.
COPY --from=build --chown=app:app /workspace/extracted/dependencies/ ./
COPY --from=build --chown=app:app /workspace/extracted/spring-boot-loader/ ./
COPY --from=build --chown=app:app /workspace/extracted/snapshot-dependencies/ ./
COPY --from=build --chown=app:app /workspace/extracted/application/ ./

USER app

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    LOG_LEVEL=info

EXPOSE 8080

# Health interno di Actuator; wget è incluso in Alpine (busybox).
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/actuator/health" || exit 1

# -XX:MaxRAMPercentage: la JVM usa al massimo il 75% della memoria assegnata al container.
# Opzioni JVM aggiuntive si passano con la variabile JAVA_TOOL_OPTIONS (es. -Xmx512m).
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "org.springframework.boot.loader.launch.JarLauncher"]
