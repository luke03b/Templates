# Immagine Docker multi-stage del backend Node.js.
# Stage 1 installa solo le dipendenze di produzione; stage 2 copia il minimo indispensabile
# in un'immagine pulita ed esegue l'app come utente non-root "node" (gia' presente nell'immagine ufficiale).

# Versione fissata (Node 26 LTS su Alpine 3.24): build riproducibili, niente tag "latest".
ARG NODE_IMAGE=node:26.13.0-alpine3.24

# ---- Stage 1: dipendenze di produzione ----
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci: installazione esatta dal lockfile. --omit=dev esclude test/lint; --ignore-scripts non esegue
# script di postinstall delle dipendenze (piu' sicuro, e a questo progetto non servono).
# Il secret opzionale "npm_ca" serve solo dietro un proxy HTTPS aziendale con certificato proprio
# (vedi README, "Problemi comuni"): non finisce nell'immagine e, se assente, viene ignorato.
RUN --mount=type=secret,id=npm_ca,required=false \
    if [ -f /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ---- Stage 2: runtime ----
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info
WORKDIR /app

# I file restano di proprieta' di root (sola lettura per l'utente "node"): l'app non puo' modificarli.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

USER node
EXPOSE 3000

# Docker considera il container "healthy" se /api/health risponde 200. Si usa node (sempre presente)
# invece di curl/wget, e process.env.PORT cosi' funziona anche cambiando la porta.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

# Avvio diretto con node (non "npm start"): cosi' node riceve SIGTERM da "docker stop"
# e il graceful shutdown in src/server.js funziona.
CMD ["node", "src/server.js"]
