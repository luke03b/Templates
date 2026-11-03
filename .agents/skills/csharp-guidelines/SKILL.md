---
name: "csharp-guidelines"
description: "Skill C# frontend con Blazor WebAssembly: struttura pagine/componenti, servizi HTTP, stato, form e validazione, configurazione, error handling e testing con bUnit."
trigger_phrases:
  - "usa c#"
  - "scrivi codice csharp"
  - "usa blazor"
  - "aggiungi una pagina blazor"
  - "aggiungi un componente blazor"
  - "code review c#"
---

## Goal
Produrre frontend C# con Blazor WebAssembly coerenti con le `frontend-guidelines`: pagine che orchestrano, componenti riusabili e presentazionali, networking isolato in servizi tipizzati e test con bUnit. Per il codice C# lato server vedi `dotnet-guidelines`.

## Instructions

1. Pagine (`Pages/`)
   - Una pagina ha la direttiva `@page` con la rotta e orchestra dati, navigazione e composizione.
   - Le pagine non usano `HttpClient` direttamente: chiamano un servizio iniettato con `@inject`.
   - La logica non banale va nel blocco `@code` o in un file code-behind `.razor.cs` (classe `partial`).

2. Componenti (`Components/`)
   - Componenti piccoli e presentazionali: ricevono dati con `[Parameter]` e notificano con `EventCallback`.
   - Contenuto annidato con `RenderFragment ChildContent`.
   - Nessuna chiamata HTTP o regola di business dentro un componente riusabile.
   - Stili isolati per componente con file `.razor.css`; i design token stanno in un unico file CSS globale.

3. Servizi e networking (`Services/`)
   - Un client API tipizzato basato su `HttpClient` e `System.Net.Http.Json`, registrato nel container DI in `Program.cs`.
   - Il client gestisce URL base (da `wwwroot/appsettings*.json`), parsing degli errori Problem Details e mapping in eccezioni o risultati leggibili per la UI.
   - Servizi di stato condiviso (es. notifiche/toast) registrati come `Scoped` (in WebAssembly equivale a singleton per utente).

4. Form e validazione
   - Usa `EditForm` con `DataAnnotationsValidator` e modelli con attributi di validazione.
   - Mostra sui campi anche gli errori di validazione restituiti dal backend.

5. Async e lifecycle
   - Carica i dati in `OnInitializedAsync`; gestisci stati di loading, errore e vuoto.
   - Chiama `StateHasChanged` solo quando l'aggiornamento parte fuori dal ciclo di rendering (es. timer, eventi di servizi).
   - Implementa `IDisposable` per disiscriverti dagli eventi dei servizi.

6. Configurazione
   - Nessun URL o valore runtime hardcodato: usa `appsettings.json` / `appsettings.Development.json` in `wwwroot`.

7. Qualità
   - `Nullable` e `TreatWarningsAsErrors` abilitati, `dotnet format` pulito.

8. Testing
   - Test dei componenti e delle pagine con bUnit e xUnit.
   - Test del client API con un `HttpMessageHandler` finto.

## Best Practices

- Preferisci composizione di componenti piccoli a pagine monolitiche.
- Usa naming PascalCase per componenti, parametri e metodi, come da convenzioni C#.
- Mantieni il contratto DTO allineato a `docs/api-contract.md`.

## Verification

Prima di considerare completo il lavoro, verifica che:

- le pagine non contengano networking diretto;
- i componenti riusabili siano presentazionali;
- il client API gestisca URL base ed errori in modo centrale;
- build, `dotnet format --verify-no-changes` e test siano verdi.
