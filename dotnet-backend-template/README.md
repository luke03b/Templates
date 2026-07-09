# .NET Backend Template

Template ASP.NET Core minimale con un endpoint di health e struttura layered di base.

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
dotnet test DotnetBackendTemplate.sln
```

2. Avvia l'applicazione.

```bash
dotnet run --project src/DotnetBackendTemplate.Api --urls http://localhost:8080
```

3. Apri `http://localhost:8080/api/health`.

## Avvio con Docker

1. Costruisci l'immagine.

```bash
docker build -t dotnet-backend-template .
```

2. Avvia il container.

```bash
docker run --rm -p 8080:8080 dotnet-backend-template
```

3. Apri `http://localhost:8080/api/health`.

## Struttura

- `src/DotnetBackendTemplate.Api/Program.cs` - bootstrap dell'app
- `src/DotnetBackendTemplate.Api/Controllers/HealthController.cs` - layer API
- `src/DotnetBackendTemplate.Application/HealthService.cs` - layer applicativo
- `src/DotnetBackendTemplate.Contracts/HealthResponse.cs` - contratto di risposta
- `tests/DotnetBackendTemplate.Tests/HealthEndpointTests.cs` - test dell'endpoint

## Avvio

1. Installa .NET 8 SDK.
2. Avvia l'app con `dotnet run --project src/DotnetBackendTemplate.Api`.

## Endpoint

- `GET /api/health` restituisce lo stato corrente dell'applicazione.
