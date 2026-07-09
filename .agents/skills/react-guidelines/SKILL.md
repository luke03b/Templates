---
name: "react-guidelines"
description: "Skill React per interfacce web: component composition, state, hooks, routing, data fetching, forms, accessibility e testing."
trigger_phrases:
  - "usa react"
  - "scrivi un componente react"
  - "aggiungi una pagina react"
  - "gestisci stato react"
  - "code review react"
---

## Goal
Produrre codice React modulare, testabile e leggibile, con separazione rigorosa tra componenti, stato, servizi di rete e logica di presentazione.

## Instructions

1. Mantieni il bootstrap minimale.
   - Il punto di ingresso deve solo montare l'app, provider globali, router e configurazioni di base.

2. Usa componenti piccoli e riusabili.
   - I componenti devono essere focalizzati sulla presentazione o su una singola responsabilita.
   - Evita componenti monolitici con troppe decisioni interne.

3. Separa stato e UI.
   - Mantieni lo stato condiviso nel layer appropriato.
   - Usa hooks o store in modo coerente con l'architettura del progetto.

4. Centralizza data fetching e side effect.
   - Le chiamate HTTP passano da service, hook o adapter dedicati.
   - I componenti non devono contenere fetch complessi o logica di trasporto.

5. Gestisci routing e flussi in modo esplicito.
   - Le pagine orchestrano navigazione e composizione.
   - Mantieni la logica di business fuori dai componenti puramente visivi.

6. Valida input e accessibilita.
   - Valida i form vicino al form stesso.
   - Mantieni label, aria attributes e focus management coerenti.

7. Gestisci errori e loading state in modo uniforme.
   - Prevedi stati di caricamento, vuoto ed errore.
   - Centralizza la trasformazione degli errori quando possibile.

8. Scrivi test mirati.
   - Aggiungi component test, hook test, service test e test di integrazione per i confini principali.

## Best Practices

- Preferisci presentational/container separation quando aiuta la chiarezza.
- Usa naming coerente per component, hook, service e file.
- Mantieni la UI prevedibile e facile da testare.

## Verification

Prima di considerare completo il lavoro, verifica che:

- il bootstrap resti minimale;
- i componenti siano piccoli e riusabili;
- il networking non sia annidato nella UI;
- stato, routing ed error handling siano centralizzati;
- esistano test pertinenti per il codice toccato.
