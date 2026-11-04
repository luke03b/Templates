# Dockerfile multi-stage: lo stage "build" usa l'SDK completo per compilare, lo stage finale
# contiene solo il runtime ASP.NET Core e l'app pubblicata (immagine molto piu piccola).
# Tag fissati: aggiornali insieme a global.json e Directory.Packages.props.

# ---------- Stage 1: build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0.403 AS build
WORKDIR /src

# Prima solo i file di progetto e il restore: questo layer resta in cache finche
# non cambiano le dipendenze, cosi le build successive sono molto piu veloci.
COPY global.json Directory.Build.props Directory.Packages.props .editorconfig ./
COPY src/DotnetBackendTemplate.Api/DotnetBackendTemplate.Api.csproj src/DotnetBackendTemplate.Api/
COPY src/DotnetBackendTemplate.Application/DotnetBackendTemplate.Application.csproj src/DotnetBackendTemplate.Application/
COPY src/DotnetBackendTemplate.Contracts/DotnetBackendTemplate.Contracts.csproj src/DotnetBackendTemplate.Contracts/
COPY src/DotnetBackendTemplate.Infrastructure/DotnetBackendTemplate.Infrastructure.csproj src/DotnetBackendTemplate.Infrastructure/
RUN dotnet restore src/DotnetBackendTemplate.Api/DotnetBackendTemplate.Api.csproj

# Poi il codice sorgente e la pubblicazione in Release.
COPY src/ src/
RUN dotnet publish src/DotnetBackendTemplate.Api/DotnetBackendTemplate.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    -p:UseAppHost=false

# ---------- Stage 2: runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0.14 AS final
WORKDIR /app

# PORT e letta dall'app (porta interna del container: 8080).
# ASPNETCORE_HTTP_PORTS (impostata dall'immagine base) viene svuotata: la porta la decide PORT.
ENV PORT=8080 \
    ASPNETCORE_HTTP_PORTS= \
    ASPNETCORE_ENVIRONMENT=Production \
    LOG_LEVEL=info \
    DOTNET_NOLOGO=1

COPY --from=build /app/publish .

# Utente non-root "app" (UID 1654) gia presente nelle immagini ufficiali .NET.
USER app

EXPOSE 8080

# L'immagine aspnet non ha curl/wget: la sonda e l'app stessa avviata con --healthcheck
# (vedi src/DotnetBackendTemplate.Api/HealthProbe.cs), che chiama GET /api/health.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["dotnet", "DotnetBackendTemplate.Api.dll", "--healthcheck"]

ENTRYPOINT ["dotnet", "DotnetBackendTemplate.Api.dll"]
