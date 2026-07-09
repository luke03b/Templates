# TypeScript Template

Template TypeScript pronto all'uso con una landing page iniziale.

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

3. Avvia il server di sviluppo.

```bash
npm run dev
```

4. Apri l'URL mostrato da Vite, in genere `http://localhost:5173`.

## Avvio con Docker

1. Costruisci l'immagine.

```bash
docker build -t typescript-template .
```

2. Avvia il container.

```bash
docker run --rm -p 8080:80 typescript-template
```

3. Apri `http://localhost:8080`.

## Struttura

- `src/main.ts` - bootstrap minimale
- `src/app.ts` - composizione dell'app
- `src/pages/landing-page.ts` - pagina principale
- `src/services/hero-service.ts` - servizio applicativo
- `src/types/hero.ts` - contratto dati
- `tests/landing-page.test.ts` - test della pagina

## Avvio

1. Installa Node.js 20 o superiore.
2. Esegui `npm install`.
3. Avvia l'app con `npm run dev`.

## Scopo

Questo template fornisce una base TypeScript modulare, tipizzata e pronta per essere adattata a frontend o tooling.
