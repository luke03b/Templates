# Node.js Backend Template

Template backend Node.js minimale con Express e un endpoint di health.

## Cosa installare in locale

- Node.js 20 o superiore.
- npm incluso con Node.js.

Verifica rapida dell'ambiente:

```bash
node --version
npm --version
```

## Avvio in locale

1. Installa le dipendenze.

```bash
npm install
```

2. Esegui i test.

```bash
npm test
```

3. Avvia il server.

```bash
npm start
```

4. Apri `http://localhost:3000/api/health`.

## Avvio con Docker

1. Costruisci l'immagine.

```bash
docker build -t nodejs-backend-template .
```

2. Avvia il container.

```bash
docker run --rm -p 3000:3000 nodejs-backend-template
```

3. Apri `http://localhost:3000/api/health`.

## Struttura

- `src/app.js` - composizione dell'app
- `src/server.js` - bootstrap del server
- `src/routes/healthRoutes.js` - layer di routing
- `src/controllers/healthController.js` - layer API
- `src/services/healthService.js` - layer applicativo
- `src/dtos/healthResponse.js` - contratto di risposta
- `tests/health.test.js` - test dell'endpoint

## Avvio

1. Installa Node.js 20 o superiore.
2. Esegui `npm install`.
3. Avvia il server con `npm start`.

## Endpoint

- `GET /api/health` restituisce lo stato corrente dell'applicazione.
