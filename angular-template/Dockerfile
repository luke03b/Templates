# syntax=docker/dockerfile:1
# Build multi-stage:
#   1) "build": Node LTS compila l'app Angular in file statici;
#   2) "runtime": nginx serve i file statici e fa da reverse proxy di /api verso il backend.
# L'immagine finale contiene solo nginx + i file compilati (nessun Node, nessun sorgente).

# ---- Stage 1: build ---------------------------------------------------------
FROM node:26.13.0-alpine AS build
WORKDIR /app

# Copiamo prima solo i manifest: se non cambiano, Docker riusa la cache di `npm ci`.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Stage 2: runtime -------------------------------------------------------
FROM nginx:1.30.6-alpine AS runtime

# URL del backend verso cui nginx inoltra /api/ (risolto a runtime: il container parte anche
# se il backend non esiste). Sovrascrivibile con `docker run -e API_UPSTREAM=...`.
ENV API_UPSTREAM=http://nodejs-backend-template:3000

# L'immagine ufficiale applica envsubst ai file in /etc/nginx/templates all'avvio
# e scrive il risultato in /etc/nginx/conf.d/.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Con @angular/build l'output dell'applicazione e' in dist/<nome-progetto>/browser.
COPY --from=build /app/dist/angular-template/browser /usr/share/nginx/html

# Esecuzione come utente non-root "nginx": gli servono permessi di scrittura su cache,
# pid file e sulla cartella in cui l'entrypoint genera la configurazione.
RUN chown -R nginx:nginx /var/cache/nginx /etc/nginx/conf.d /usr/share/nginx/html \
    && touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid \
    && sed -i '/^user /d' /etc/nginx/nginx.conf
USER nginx

# Porta 80 anche da non-root: Docker (>= 20.10) imposta di default nel container
# net.ipv4.ip_unprivileged_port_start=0. Su Kubernetes vedi la sezione Troubleshooting del README.
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
