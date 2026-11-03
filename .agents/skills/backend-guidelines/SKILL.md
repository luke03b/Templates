---
name: "backend-guidelines"
description: "Skill backend agnostica al framework: architettura layered, controller/api layer, application services, repository, validazione, sicurezza, error handling e testing."
trigger_phrases:
  - "scrivi backend"
  - "applica regole backend"
  - "crea un endpoint API"
  - "modifica il service backend"
  - "code review backend"
---

## Goal
Assicurare che ogni cambiamento backend rispetti una architettura layered rigorosa, con un layer di ingresso sottile, un layer applicativo orientato ai casi d'uso, un layer di accesso ai dati isolato, sicurezza centralizzata e gestione coerente degli errori.

## Instructions

Quando lavori sul backend, segui questo flusso senza eccezioni:

1. API / Controller layer
   - Riceve la request.
   - Valida l'input con DTO o schema equivalenti del framework usato.
   - Non contiene logica di business.
   - Non parla direttamente con il database.
   - Non gestisce retry, fallback o integrazione HTTP complessa.

2. Application / Service layer
   - Contiene la logica di business e orchestrazione.
   - Combina validazione applicativa, regole di dominio, repository e integrazioni esterne.
   - Gestisce transazioni o unit of work nei metodi che modificano lo stato.
   - Incapsula fallback, selezione di un provider esterno, scan e risoluzione dei casi d'uso.

3. Repository / Data access layer
   - Esegue soltanto accesso ai dati.
   - Non contiene regole di business.
   - Non conosce controller o altri service.
   - Espone metodi di lookup chiari e allineati al dominio.

4. DTO ed entity / domain models
   - Usa DTO per input e output dell'API.
   - Usa entity o domain model solo per persistenza o rappresentazione del dominio, secondo il pattern del framework.
   - Non esporre il modello persistente direttamente come contratto pubblico se esiste una DTO adeguata.

5. Validazione
   - Valida i body nel layer di ingresso.
   - Sposta le regole dipendenti dallo stato nel service.
   - Per upload multipart o file upload, valida il file prima di qualsiasi elaborazione.
   - Per autenticazione, valida credenziali, email e password prima di generare token o sessioni.

6. Error handling
   - Usa un gestore centralizzato degli errori o un middleware equivalente.
   - Mappa i casi attesi a codici HTTP specifici.
   - Logga gli errori inattesi e restituisci messaggi sicuri al client.
   - Non lasciare eccezioni grezze propagate all'API.

7. Security
   - Usa autenticazione stateless quando il progetto lo richiede.
   - Password o segreti sensibili devono essere sempre protetti con gli strumenti standard del framework.
   - Centralizza le regole di autorizzazione nella configurazione di sicurezza.
   - Usa ruoli o policy esplicite per le operazioni privilegiate.
   - Origini CORS e policy di accesso devono arrivare da configurazione, non da costanti hardcoded.

8. Persistence and schema
   - Cambiamenti schema solo tramite il meccanismo di migrazione previsto dal progetto.
   - Non affidarti a schema creation automatica se il progetto usa validate o una strategia equivalente.
   - Usa il backend come sorgente di verita per registry, selezione e stato dei provider esterni.

9. External service integration
   - Tratta i provider esterni come servizi HTTP o RPC separati.
   - Il backend risolve il target e poi chiama l'endpoint corretto.
   - Non codificare la logica di elaborazione esterna nel controller.

## Contratto API dei template

- Le rotte (`/api/health`, CRUD `/api/items`), il formato degli errori (Problem Details, RFC 9457, `application/problem+json`) e le variabili d'ambiente (`PORT`, `CORS_ORIGINS`, `LOG_LEVEL`) sono definiti in `docs/api-contract.md` e sono identici in tutti i backend.
- Il repository dei dati sta dietro un'interfaccia: l'implementazione in memoria si sostituisce con una su database senza toccare controller e service.
- Ogni backend ha OpenAPI/Swagger, un `.env.example`, un Dockerfile multi-stage non-root con HEALTHCHECK e test di integrazione HTTP su tutti gli endpoint.

## Best Practices

- Tieni i controller o handler brevi e leggibili.
- Se una logica richiede piu di un passaggio, spostala in un service privato o in un helper dedicato.
- Usa record, DTO immutabili o view model dove il payload e read-only.
- Mantieni le risposte piccole, esplicite e coerenti.
- Scrivi test mirati per ogni layer toccato.

## Verification

Prima di chiudere un task backend, verifica che:

- il layer di ingresso faccia solo trasporto e validazione;
- il service contenga la logica di business;
- il repository sia solo data access;
- la validazione e gli errori siano coerenti con il resto del backend;
- la security non sia stata bypassata;
- i test del layer coinvolto coprano il nuovo comportamento.
