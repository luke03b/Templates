---
name: "frontend-guidelines"
description: "Skill frontend agnostica al framework: architettura UI, page/view split, state management, data fetching, localizzazione, offline e testing."
trigger_phrases:
  - "scrivi frontend"
  - "crea una screen"
  - "aggiungi un componente UI"
  - "gestisci lo stato frontend"
  - "code review frontend"
---

## Goal
Garantire che ogni modifica frontend rispetti un'architettura UI pulita: bootstrap minimale, stato centralizzato, networking isolato, componenti riusabili e logica di pagina separata dalla presentazione.

## Instructions

Quando lavori sul frontend, applica queste regole:

1. Bootstrapping
   - Mantieni il punto di ingresso focalizzato su inizializzazione, localizzazione, provider o store e root widget.
   - Non inserire logica applicativa complessa nel bootstrap.

2. Pages / Screens / Views
   - Usa le pagine per orchestrare navigazione, flussi e composizione della pagina.
   - Le pagine non devono contenere networking diretto se un service o adapter puo farlo.
   - Una pagina deve sapere cosa mostrare e quando navigare, non come parlare col backend.

3. Components / Widgets
   - Usa i componenti per elementi riusabili e puramente visuali.
   - Componenti come bottoni, campi testo, card, indicatori e loghi devono restare presentazionali.
   - Non mettere business logic o chiamate HTTP dentro un componente riusabile.

4. State management
   - Usa un meccanismo di stato condiviso coerente con lo stack del progetto.
   - Tieni lo stato di autenticazione, tema, lingua, rete e cache nello strato di stato centrale.
   - Aggiorna la UI in modo reattivo con il pattern nativo del framework.
   - Non gestire lo stato globale dentro singoli componenti.

5. Networking
   - Tutte le chiamate HTTP passano da un service o adapter centrale.
   - Il layer di networking gestisce base URL, header, token, multipart o upload, parsing errori e DTO.
   - Le pagine chiamano lo stato centrale; lo stato centrale chiama il service.

6. Auth and session
   - Mantieni il token o la sessione in modo centralizzato.
   - Verifica la validita della sessione all'avvio.
   - Usa cache locale per il bootstrap offline quando possibile.
   - Logout deve pulire memoria e storage persistente.

7. Offline and connectivity
   - La connettivita va gestita in modo centrale, non disperso.
   - Usa il servizio di offline storage per i dati persistenti locali.
   - La sincronizzazione dei pending items va fatta dal layer di stato, non dal componente.

8. Localization
   - Usa il sistema di localizzazione gia presente nel progetto.
   - Non hardcodare stringhe tradotte quando esiste gia una chiave locale.
   - La selezione lingua va gestita dal layer di stato e riflessa in UI.

9. Validation and helpers
   - Le regole riusabili vanno in utility o helper dedicati.
   - I validator vanno riusati tra le form.
   - I componenti di input devono accettare validator e configurazioni, non implementare logica di dominio.

10. Error handling
   - Centralizza il parsing degli errori nel layer di networking.
   - Converti i messaggi backend in errori leggibili per la UI.
   - Proteggi la navigazione asincrona con controlli sul lifecycle quando necessario.

11. Testing
   - Aggiungi test per componenti e pagine principali.
   - Aggiungi test per il layer di stato e per gli effetti collaterali.
   - Aggiungi test per validazione e helper puri.

## Best Practices

- Mantieni il confine chiaro: pagine per flussi, componenti per presentazione, stato centrale per logica condivisa, services per trasporto e storage.
- Preferisci composizione e riuso rispetto a componenti monolitici.
- Se una nuova feature tocca backend e frontend, separa chiaramente il contratto DTO dalla UI.
- Scrivi codice che sia semplice da testare con il framework di test dello stack usato.

## Verification

Prima di considerare completata una modifica frontend, verifica che:

- la UI sia costruita con componenti riusabili e presentazionali;
- il networking passi dal layer centrale di service o adapter;
- lo stato condiviso sia nel posto corretto;
- la localizzazione non sia stata bypassata;
- siano presenti test pertinenti per componenti, stato o utility toccati.
