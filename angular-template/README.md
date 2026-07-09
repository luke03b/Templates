# Angular Template

Template base Angular pronto all'uso con una landing page iniziale.

## Cosa installare in locale

- Node.js 20 o superiore.
- npm incluso con Node.js.

Se vuoi usare i comandi `ng` globali, installa anche Angular CLI.

Verifica rapida dell'ambiente:

```bash
node --version
npm --version
npx ng version
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
npm start
```

4. Apri `http://localhost:4200`.

## Avvio con Docker

1. Costruisci l'immagine.

```bash
docker build -t angular-template .
```

2. Avvia il container.

```bash
docker run --rm -p 8080:80 angular-template
```

3. Apri `http://localhost:8080`.

## Struttura

- `src/main.ts` - bootstrap dell'app standalone
- `src/app/app.component.ts` - shell dell'app
- `src/app/landing-page/landing-page.component.ts` - landing page base
- `src/app/landing-page/landing-page.component.spec.ts` - test della landing page

## Avvio

1. Installa le dipendenze.
2. Avvia il server con `npm start`.

## Scopo

Questo template fornisce una landing page pulita, responsive e facilmente estendibile con routing, stato e servizi.
