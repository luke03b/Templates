---
name: "nodejs-guidelines"
description: "Skill Node.js per backend e tooling: modularita, services, controllers/handlers, middleware, async flow, validation, persistence, logging e testing."
trigger_phrases:
  - "usa node"
  - "usa nodejs"
  - "scrivi un servizio node"
  - "aggiungi un endpoint node"
  - "code review node"
---

## Goal
Produrre codice Node.js modulare e affidabile, con confini chiari tra routing, logica applicativa, accesso ai dati, middleware, validazione e integrazioni esterne.

## Instructions

1. Usa un layer di ingresso sottile.
   - Handler, controller o route devono ricevere input e delegare.
   - Non inserire business logic nel livello HTTP.

2. Metti la logica di business nei service.
   - I service orchestrano i casi d'uso e le regole di dominio.
   - Mantieni separati service, repository e adapter esterni.

3. Centralizza middleware e cross-cutting concerns.
   - Autenticazione, error handling, logging, rate limit e validation middleware devono essere riusabili.
   - Non duplicare la stessa logica in piu route.

4. Gestisci l'asincronia in modo disciplinato.
   - Usa async/await in modo coerente.
   - Cattura e propaga gli errori in modo prevedibile.

5. Separa DTO, schema e model.
   - Usa oggetti di trasferimento per input e output.
   - Usa schema o validator per la validazione.
   - Usa model o entity solo dove serve al dominio o alla persistenza.

6. Centralizza accesso ai dati e integrazioni.
   - Repository, database client, SDK e adapter devono stare in layer dedicati.
   - Non chiamare direttamente il database o servizi esterni dai handler.

7. Gestisci configurazione e segreti esternamente.
   - Usa env vars o config file del progetto.
   - Non hardcodare token, URL o credenziali.

8. Scrivi test mirati.
   - Aggiungi unit test per service e helper.
   - Aggiungi integration test per route, middleware e adapter critici.

## Best Practices

- Mantieni moduli piccoli e responsabilita chiare.
- Usa naming coerente per file, route, service e middleware.
- Preferisci composizione a catene di callback complicate.

## Verification

Prima di considerare completo il lavoro, verifica che:

- il layer HTTP sia sottile;
- i service contengano la logica di business;
- middleware e validation siano centralizzati;
- l'asincronia e gli errori siano gestiti bene;
- esistano test pertinenti per il codice toccato.
