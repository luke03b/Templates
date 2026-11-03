# syntax=docker/dockerfile:1
# Immagine Docker multi-stage dell'API.
#   1. build : installa tutte le dipendenze, esegue type-check e `vite build` -> dist/
#   2. deps  : installa SOLO le dipendenze di produzione (niente TypeScript, Vite, Vitest, ...)
#   3. runtime: immagine finale minima con dist/ + node_modules di produzione, utente non-root.

ARG NODE_VERSION=26.13.0

# ---------- 1. build ----------
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts ./
COPY src ./src
RUN npm run build

# ---------- 2. dipendenze di produzione ----------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- 3. runtime ----------
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3001 \
    LOG_LEVEL=info
WORKDIR /app

# I file restano di proprieta' di root (sola lettura per l'app); il processo gira come
# utente non privilegiato "node", gia' presente nell'immagine ufficiale.
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node

EXPOSE 3001

# Usa fetch nativo di Node: nessun bisogno di curl/wget nell'immagine.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3001) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Forma "exec" (array JSON): node e' il processo PID 1 e riceve direttamente SIGTERM,
# cosi' il graceful shutdown di src/server.ts funziona con `docker stop`.
CMD ["node", "dist/server.js"]
