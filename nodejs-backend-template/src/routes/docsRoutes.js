// Documentazione interattiva dell'API: Swagger UI su /docs e specifica JSON su /docs/openapi.json.
// La specifica e' scritta a mano in src/docs/openapi.yaml (approccio "contract first"):
// quando aggiungi o modifichi una rotta, aggiorna anche quel file.
import { readFileSync } from 'node:fs';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

// Percorso del file risolto rispetto a questo modulo (in ESM non esiste __dirname).
const OPENAPI_PATH = new URL('../docs/openapi.yaml', import.meta.url);

/** Legge e converte in oggetto la specifica OpenAPI (una sola volta, all'avvio). */
export function loadOpenApiDocument() {
  return parse(readFileSync(OPENAPI_PATH, 'utf8'));
}

export function createDocsRouter() {
  const document = loadOpenApiDocument();
  const router = Router();

  router.get('/openapi.json', (_req, res) => {
    res.json(document);
  });
  // swaggerUi.serve serve i file statici (JS/CSS) di Swagger UI, setup() genera la pagina HTML.
  router.use(
    '/',
    ...swaggerUi.serve,
    swaggerUi.setup(document, {
      customSiteTitle: 'nodejs-backend-template API',
      // Disattiva il badge di validazione che contatterebbe un server esterno.
      swaggerOptions: { validatorUrl: null },
    }),
  );

  return router;
}
