---
name: "flutter-guidelines"
description: "Skill Flutter per UI mobile/web: widget composition, state management, async data flow, navigation, localization e testing."
trigger_phrases:
  - "usa flutter"
  - "scrivi una screen flutter"
  - "aggiungi un widget flutter"
  - "gestisci lo stato flutter"
  - "code review flutter"
---

## Goal
Produrre codice Flutter pulito, testabile e coerente con l'architettura UI del progetto, separando presentazione, stato, networking e storage.

## Instructions

1. Mantieni il punto di ingresso minimale.
   - `main` deve occuparsi di bootstrap, dipendenze globali, tema, localizzazione e root widget.
   - Non inserire logica di business nel bootstrap.

2. Usa le screen per i flussi.
   - Le screen orchestrano navigazione e composizione della pagina.
   - Non chiamare HTTP direttamente dalle screen se un service o provider puo farlo.

3. Usa i widget per la presentazione.
   - I widget devono essere riusabili e focalizzati sull'aspetto visivo.
   - Bottoni, campi, card, indicatori e loghi non devono contenere logica di dominio.

4. Centralizza lo stato.
   - Usa il pattern di state management gia adottato nel progetto.
   - Tieni nello stato centrale autenticazione, tema, lingua, cache e sincronizzazione.

5. Centralizza il networking.
   - Le chiamate HTTP passano da un service o adapter dedicato.
   - Il networking gestisce base URL, headers, token, upload, parsing errori e DTO.

6. Gestisci sessione e offline in modo esplicito.
   - Verifica la sessione all'avvio.
   - Usa cache locale per bootstrap e sincronizzazione quando il progetto lo richiede.

7. Rispetta localizzazione e test.
   - Non hardcodare stringhe quando esistono chiavi di localizzazione.
   - Aggiungi widget test, state test e utility test per il codice toccato.

## Best Practices

- Tieni il confine chiaro: screen per flussi, widget per presentazione, stato per logica condivisa, service per trasporto e storage.
- Preferisci composizione e riuso rispetto a widget monolitici.
- Usa nomi descrittivi e coerenti con il dominio.

## Verification

Prima di considerare completo il lavoro, verifica che:

- il bootstrap resti minimale;
- il networking non sia entrato nei widget;
- lo stato sia centralizzato;
- la UI sia riusabile;
- esistano test pertinenti per il livello modificato.
