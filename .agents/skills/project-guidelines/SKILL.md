---
name: "project-guidelines"
description: "Skill baseline del progetto: struttura, naming, formattazione, orchestrazione, error handling, logging e testing, indipendenti dal framework usato."
trigger_phrases:
  - "regole generali del progetto"
  - "convenzioni del progetto"
  - "golden standard"
  - "scrivi secondo le regole del progetto"
---

## Goal
Garantire che ogni nuovo lavoro rispetti principi architetturali riusabili in qualunque stack: separazione delle responsabilita, naming coerente, gestione strutturata degli errori, logging diagnostico e test adeguati al layer toccato.

## Instructions

Quando lavori in questo progetto, segui queste regole in modo rigido:

1. Mantieni il sistema diviso in confini di responsabilita indipendenti.
   - Ogni servizio o modulo deve avere un ruolo chiaro e non sovrapposto.
   - L'orchestrazione e la composizione del sistema restano al livello piu alto possibile del repository.

2. Rispetta la struttura esistente del repository.
   - Organizza il codice per responsabilita: presentazione, applicazione, accesso ai dati, sicurezza, configurazione, error handling, utilita condivise.
   - Non spostare codice tra moduli senza un motivo architetturale forte.

3. Usa naming coerente con il codice esistente.
   - Classi e tipi: PascalCase.
   - Metodi, campi e variabili: lowerCamelCase.
   - Costanti: UPPER_SNAKE_CASE.
   - File e cartelle: segui la convenzione del linguaggio o framework usato nel progetto.
   - Namespace e package: usa nomi descrittivi e stabili legati al dominio.

4. Mantieni la formattazione leggibile e locale al file.
   - Evita refactor di stile non necessari.
   - Preferisci funzioni brevi, un ruolo per file e commenti minimi ma utili.
   - Non introdurre code smell o nesting eccessivo.

5. Gestisci gli errori in modo strutturato.
   - Usa risposte o risultati coerenti con una forma prevedibile.
   - Logga gli errori inattesi con logger strutturati.
   - Non esporre stack trace, password, token o dati sensibili.

6. Mantieni il testing vicino al layer toccato.
   - Testa la presentazione con test di componenti o view.
   - Testa la logica applicativa con unit test mirati.
   - Testa i confini con mock o test slice quando il codice tocca dipendenze esterne.

7. Usa configurazione esterna quando disponibile.
   - Variabili ambiente e file di configurazione per valori runtime.
   - Health check e orchestration a livello di deployment, non dentro la logica di business.

## Best Practices

- Preferisci estendere pattern esistenti invece di introdurre un nuovo stile parallelo.
- Se un file ha gia una responsabilita chiara, inserisci il nuovo codice nel layer corretto invece di creare scorciatoie.
- Mantieni le modifiche piccole, coerenti e facili da testare.
- Documenta solo cio che serve davvero a un agente futuro per prendere la decisione corretta.

## Verification

Prima di considerare completo il lavoro, verifica che:

- il codice sia collocato nel layer giusto;
- i naming siano coerenti con il repository;
- gli errori siano gestiti con la stessa forma del progetto;
- esista almeno un test coerente con il livello modificato, quando applicabile.
