---
name: "python-guidelines"
description: "Skill Python agnostica al framework: packaging, typing, services, data flow, validation, error handling, logging e testing."
trigger_phrases:
  - "usa python"
  - "scrivi codice python"
  - "aggiungi una classe python"
  - "modifica un service python"
  - "code review python"
---

## Goal
Produrre codice Python semplice, tipizzato quando utile, modulare e testabile, indipendente dal framework web, CLI o data pipeline usato sopra di esso.

## Instructions

1. Mantieni moduli e package piccoli.
   - Ogni file deve avere una responsabilita chiara.
   - Non mescolare transport, business logic e storage nello stesso modulo se puoi evitarlo.

2. Usa typing e dataclass quando aiutano.
   - Definisci type hint chiari per contratti e funzioni.
   - Usa dataclass, pydantic o strutture equivalenti quando il progetto lo richiede.

3. Centralizza servizi e repository.
   - Le operazioni di business vanno in service dedicati.
   - L'accesso ai dati va in repository o adapter dedicati.

4. Gestisci validazione e errori in modo esplicito.
   - Valida gli input presto.
   - Traduce gli errori in messaggi chiari e coerenti.

5. Logga in modo diagnostico.
   - Usa logging strutturato o standard library in modo consistente.
   - Non loggare segreti o payload sensibili.

6. Tratta l'asincronia con disciplina.
   - Se il progetto e async, usa await in modo coerente.
   - Se il progetto e sync, evita di introdurre complessita inutile.

7. Mantieni i test vicini al codice.
   - Scrivi unit test per funzioni pure e service.
   - Usa mock per file system, rete e altri confini esterni.

## Best Practices

- Preferisci funzioni piccole e leggibili.
- Mantieni i contratti dei dati espliciti.
- Usa nomi descrittivi e coerenti con il dominio.

## Verification

Prima di considerare completo il lavoro, verifica che:

- i moduli siano ben separati;
- typing e contratti siano chiari;
- validazione, error handling e logging siano coerenti;
- i confini esterni siano isolati;
- esistano test pertinenti per il codice toccato.
