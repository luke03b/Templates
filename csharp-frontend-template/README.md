# C# Backend Template

Template C# minimale con ASP.NET Core, organizzato in layer e con un endpoint di health.

## Cosa installare in locale

- .NET 8 SDK.

Verifica rapida dell'ambiente:

```bash
dotnet --version
dotnet --info
```

## Avvio in locale

1. Esegui i test.

```bash
dotnet test CSharpBackendTemplate.sln
```

2. Avvia l'applicazione.

```bash
dotnet run --project src/CSharpBackendTemplate.Api --urls http://localhost:8080
```

3. Apri `http://localhost:8080/api/health`.

## Avvio con Docker

1. Costruisci l'immagine.

```bash
docker build -t csharp-template .
```

2. Avvia il container.

```bash
docker run --rm -p 8080:8080 csharp-template
```

3. Apri `http://localhost:8080/api/health`.

## Struttura

- `src/CSharpBackendTemplate.Api/Program.cs` - bootstrap dell'app
- `src/CSharpBackendTemplate.Api/Controllers/HealthController.cs` - layer API
- `src/CSharpBackendTemplate.Application/HealthService.cs` - layer applicativo
- `src/CSharpBackendTemplate.Contracts/HealthResponse.cs` - contratto di risposta
- `tests/CSharpBackendTemplate.Tests/HealthEndpointTests.cs` - test dell'endpoint

## Avvio

1. Installa .NET 8 SDK.
2. Avvia l'app con `dotnet run --project src/CSharpBackendTemplate.Api`.

## Endpoint

- `GET /api/health` restituisce lo stato corrente dell'applicazione.
