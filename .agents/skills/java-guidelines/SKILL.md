---
name: "java-guidelines"
description: "Skill Java agnostica al framework: layering, controllers/handlers, services, repositories, validation, security, persistence, error handling e testing."
trigger_phrases:
  - "usa java"
  - "scrivi codice java"
  - "aggiungi un controller java"
  - "modifica un service java"
  - "code review java"
---

## Goal
Produrre codice Java coerente con un'architettura layered, con chiari confini tra ingresso HTTP, logica applicativa, accesso ai dati, sicurezza e test.

## Instructions

1. Usa un layer di ingresso sottile.
   - Controller o handler devono ricevere input, validarlo e delegare.
   - Non inserire business logic nel layer di ingresso.

2. Metti la logica di business nei service.
   - I service orchestrano i casi d'uso, le regole di dominio e le integrazioni.
   - Gestisci transazioni o unit of work nei punti che modificano stato.

3. Mantieni i repository per il solo accesso ai dati.
   - Nessuna regola di business nei repository.
   - Query e lookup devono essere espliciti e leggibili.

4. Separa DTO, entity e domain model.
   - Usa DTO per input e output.
   - Usa entity o domain model per persistenza o dominio.
   - Non esporre direttamente il modello persistente se puoi evitare.

5. Valida presto e in modo esplicito.
   - Valida input nel layer di ingresso.
   - Sposta le regole dipendenti dallo stato nel service.

6. Gestisci sicurezza e configurazione centralmente.
   - Usa autenticazione e autorizzazione centralizzate.
   - Non hardcodare segreti o origini runtime.

7. Gestisci errori in modo uniforme.
   - Usa un gestore centralizzato degli errori o un equivalente.
   - Mappa i casi attesi a codici e messaggi chiari.

8. Mantieni test mirati.
   - Testa controller, service, repository e gestore errori con il livello appropriato.

## Best Practices

- Preferisci classi piccole con una sola responsabilita.
- Usa nomi coerenti con il dominio.
- Mantieni la separazione tra API, applicazione e persistence.

## Verification

Prima di considerare completo il lavoro, verifica che:

- il controller sia sottile;
- il service contenga la logica di business;
- il repository sia solo data access;
- validazione e error handling siano coerenti;
- esistano test del livello toccato.
