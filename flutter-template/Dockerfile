# Dockerfile multi-stage:
#   1) "build": compila l'app Flutter per il web con l'SDK ufficiale
#   2) "runtime": serve i file statici con nginx (immagine piccola, nessun SDK)

# ---------- Stage 1: build ----------
# buildpack-deps (immagine Docker ufficiale) ha già curl, git, unzip e xz
# richiesti dall'SDK Flutter, quindi non serve apt-get. Sopra installiamo
# l'SDK ufficiale (tarball Google) con versione e checksum fissati: build
# riproducibile e STESSA versione indicata nel README.
# (L'immagine ghcr.io/cirruslabs/flutter è ferma a 3.44.0 al momento della
# stesura: se preferisci usarla, sostituisci questo stage con
# "FROM ghcr.io/cirruslabs/flutter:<versione> AS build" e togli il download.)
FROM buildpack-deps:trixie AS build

ARG FLUTTER_VERSION=3.47.9
ARG FLUTTER_SHA256=25ed8c3c29d51a7353f2a944310b478af8214920639524b19c50a19e6c044c5a

RUN curl -fsSL -o /tmp/flutter.tar.xz \
      "https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz" \
    && echo "${FLUTTER_SHA256}  /tmp/flutter.tar.xz" | sha256sum -c - \
    && tar -xf /tmp/flutter.tar.xz -C /opt \
    && rm /tmp/flutter.tar.xz \
    && git config --global --add safe.directory /opt/flutter

ENV PATH="/opt/flutter/bin:${PATH}"
RUN flutter --disable-analytics \
    && flutter precache --web --no-android --no-ios

WORKDIR /app

# Prima solo i manifest: se non cambiano, Docker riusa la cache delle dipendenze.
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get --enforce-lockfile

COPY . .
# API_BASE_URL vuoto = chiamate relative /api, gestite dal proxy di nginx.
ARG API_BASE_URL=""
# --no-web-resources-cdn: CanvasKit (motore di rendering) servito da nginx
# invece che dal CDN Google: l'app funziona anche in reti senza accesso esterno.
RUN flutter build web --release --no-web-resources-cdn \
      --dart-define=API_BASE_URL=${API_BASE_URL}

# ---------- Stage 2: runtime ----------
FROM nginx:1.30.6-alpine AS runtime

# Backend verso cui nginx inoltra /api/ (sovrascrivibile con -e API_UPSTREAM=...).
ENV API_UPSTREAM=http://nodejs-backend-template:3000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/build/web /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
