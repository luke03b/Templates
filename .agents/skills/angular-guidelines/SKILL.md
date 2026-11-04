---
name: "angular-guidelines"
description: "Skill Angular per app web: componenti, routing, servizi, reactive state, forms, RxJS, HTTP, localizzazione e test."
trigger_phrases:
  - "usa angular"
  - "scrivi un componente angular"
  - "aggiungi un service angular"
  - "gestisci stato angular"
  - "code review angular"
---

## Goal
Produrre codice Angular pulito e modulare, con separazione rigorosa tra componenti, servizi, stato reattivo, routing, form validation e accesso ai dati.

## Instructions

1. Usa componenti per la UI.
   - I componenti devono essere piccoli, riusabili e focalizzati sulla presentazione.
   - I componenti non devono contenere logica di accesso ai dati.

2. Usa services per la logica applicativa.
   - HTTP, mapping DTO, caching e orchestrazione vanno nei services.
   - I componenti chiamano services o layer di stato, non fetch diretti.

3. Centralizza lo stato.
   - Usa il pattern di state management adottato nel progetto.
   - Mantieni selezioni, filtri, autenticazione e dati condivisi fuori dai componenti.

4. Usa routing e view composition in modo esplicito.
   - Le route devono definire il flusso delle pagine.
   - I componenti pagina orchestrano layout e navigazione, non logica di business complessa.

5. Gestisci form e validazione in modo coerente.
   - Le validazioni devono essere vicine ai form e riusabili.
   - Gli errori di validazione devono essere leggibili e consistenti.

6. Usa RxJS o primitive reattive in modo disciplinato.
   - Evita subscription non gestite.
   - Mantieni i flussi asincroni leggibili e testabili.

7. Centralizza error handling e networking.
   - Usa interceptor o service dedicati per headers, token e error mapping.
   - Non duplicare la logica di gestione errori in ogni componente.

8. Scrivi test mirati.
   - Aggiungi component test, service test e test di routing o stato quando serve.

## Convenzioni Angular 22 usate nel template

- Nomi file e classi senza suffisso: `app.ts` con classe `App`, `home.ts` con classe `Home` (stile generato da `ng new` dalla v20 in poi).
- Zoneless e `ChangeDetectionStrategy.OnPush` sono il default; stato con signals, control flow `@if`/`@for`, `inject()` al posto dei costruttori.
- `provideHttpClient` usa già fetch: non aggiungere `withFetch()` (deprecato in v22).
- Test con Vitest (`ng test`), UI con Angular Material e token in `src/styles.scss`.

## Best Practices

- Mantieni il confine chiaro: componenti per UI, services per logica, state per dati condivisi, helpers per funzioni pure.
- Preferisci composizione e presentational/container separation quando utile.
- Usa naming coerente per feature module, component e service.

## Verification

Prima di considerare completo il lavoro, verifica che:

- i componenti siano piccoli e presentazionali;
- i services contengano la logica applicativa;
- lo stato condiviso non sia disperso nei componenti;
- l'errore e il token handling siano centralizzati;
- esistano test pertinenti per componenti e services toccati.
