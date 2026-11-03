# Dockerfile multi-stage:
#   1) "build": Node LTS installa le dipendenze e compila l'app con Vite (cartella dist/);
#   2) "runtime": nginx serve solo i file statici. Node non finisce nell'immagine finale.

# ---------- Stage 1: build ----------
FROM node:26.13.0-alpine3.24 AS build
WORKDIR /app

# Copiamo prima solo i manifest: se non cambiano, Docker riusa la cache di "npm ci".
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Le variabili VITE_ vanno passate in fase di BUILD (finiscono nel bundle):
#   docker build --build-arg VITE_APP_TITLE="My App" .
ARG VITE_APP_TITLE="React Template"
ARG VITE_API_BASE_URL=/api
ENV VITE_APP_TITLE=$VITE_APP_TITLE VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM nginx:1.30.6-alpine3.24 AS runtime

# Backend verso cui nginx inoltra /api/ (sovrascrivibile con -e API_UPSTREAM=...).
ENV API_UPSTREAM=http://nodejs-backend-template:3000

# Esecuzione come utente non-root "nginx": spostiamo il pid file in /tmp e rendiamo
# scrivibili le cartelle che nginx e il suo entrypoint (envsubst) devono modificare.
RUN sed -i -e 's,^pid .*;,pid /tmp/nginx.pid;,' -e '/^user /d' /etc/nginx/nginx.conf \
    && rm -f /etc/nginx/conf.d/default.conf \
    && chown -R nginx:nginx /var/cache/nginx /etc/nginx/conf.d

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
