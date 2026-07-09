# Template Index

Questa cartella contiene i template pronti all'uso per stack diversi.

## Template disponibili

- [Flutter template](flutter-template)
- [Angular template](angular-template)
- [React template](react-template)
- [TypeScript template](typescript-template)
- [Java backend template](java-template)
- [Python backend template](python-backend-template)
- [.NET backend template](dotnet-backend-template)
- [C# backend template](csharp-template)
- [Node.js backend template](nodejs-backend-template)

## Come eseguire in locale

Ogni template ha un proprio `README.md` con i prerequisiti e i comandi locali.

In generale:

1. Entra nella cartella del template.
2. Installa le dipendenze indicate nel suo `README.md`.
3. Esegui i test indicati nel suo `README.md`.
4. Avvia il progetto con il comando locale suggerito.

## Come eseguire con Docker

Ogni template ha il suo `Dockerfile`.

Per avviare tutti i template web e backend insieme usa:

```bash
docker compose -f templates/docker-compose.yml up --build
```

Per fermare tutto:

```bash
docker compose -f templates/docker-compose.yml down
```

## Porte esposte

- Flutter: `8081`
- Angular: `8082`
- React: `8083`
- TypeScript: `8084`
- Java backend: `8085`
- Python backend: `8086`
- .NET backend: `8087`
- C# backend: `8088`
- Node.js backend: `8089`
