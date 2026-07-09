---
name: "typescript-guidelines"
description: "Skill TypeScript agnostica al framework: typing, moduli, services, state, async flow, API contracts, error handling e testing."
trigger_phrases:
  - "usa typescript"
  - "scrivi codice typescript"
  - "aggiungi un service typescript"
  - "modifica un modulo typescript"
  - "code review typescript"
---

## Goal
Produrre codice TypeScript tipizzato, modulare e testabile, indipendente dal framework UI o backend usato sopra di esso.

## Instructions

1. Usa typing esplicito quando serve chiarezza.
   - Definisci interface, type alias e generics per contratti chiari.
   - Evita any salvo casi realmente inevitabili.

2. Mantieni i moduli piccoli e responsabili.
   - Ogni modulo deve avere uno scopo chiaro.
   - Non mescolare UI, networking, domain logic e storage nello stesso file.

3. Centralizza servizi e adapter.
   - HTTP, storage, mapping e integrazioni esterne devono stare in layer dedicati.
   - I componenti o consumer usano servizi, non dettagli di trasporto.

4. Gestisci lo stato in modo coerente.
   - Lo stato condiviso deve stare in uno strato centrale.
   - Non spargere side effect in tutto il codice.

5. Tratta l'asincronia con disciplina.
   - Usa async/await o primitive reattive in modo leggibile.
   - Gestisci errori e timeout nel layer giusto.

6. Definisci contratti API chiari.
   - Separare request DTO, response DTO e mapping.
   - Non esporre oggetti interni come contratto pubblico se puoi evitarlo.

7. Gestisci errori in modo coerente.
   - Centralizza la trasformazione degli errori.
   - Fornisci messaggi leggibili e codice sufficiente per il consumer.

8. Mantieni test mirati.
   - Scrivi unit test per funzioni pure e service.
   - Scrivi test di integrazione per i confini principali.

## Best Practices

- Preferisci composizione e dipendenze esplicite.
- Mantieni i tipi vicini ai loro domini.
- Usa naming coerente per moduli, file e funzioni.

## Verification

Prima di considerare completo il lavoro, verifica che:

- i tipi siano espliciti e leggibili;
- i moduli abbiano una responsabilita chiara;
- i service e gli adapter siano centralizzati;
- l'asincronia e gli errori siano gestiti bene;
- esistano test adeguati al codice toccato.
