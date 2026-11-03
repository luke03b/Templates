# Dockerfile multi-stage:
#  1) "build": immagine con l'SDK .NET che compila e pubblica l'app Blazor WebAssembly;
#  2) "runtime": nginx alpine che serve solo i file statici di publish/wwwroot (nessun .NET a runtime).

# ---------- 1) Build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0.403 AS build
WORKDIR /src
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1

# Prima solo i file di progetto: il restore resta in cache finché non cambiano le dipendenze.
COPY global.json Directory.Build.props Directory.Packages.props .editorconfig ./
COPY src/CSharpFrontendTemplate/CSharpFrontendTemplate.csproj src/CSharpFrontendTemplate/
RUN dotnet restore src/CSharpFrontendTemplate/CSharpFrontendTemplate.csproj

COPY src/ src/
# Il publish crea anche le versioni precompresse .gz/.br. nginx ufficiale usa solo .gz: rimuoviamo .br.
RUN dotnet publish src/CSharpFrontendTemplate/CSharpFrontendTemplate.csproj -c Release -o /app/publish --no-restore \
    && find /app/publish/wwwroot -name '*.br' -delete

# ---------- 2) Runtime ----------
FROM nginx:1.30.6-alpine AS runtime

# Backend raggiunto da nginx per /api/ (sovrascrivibile con -e API_UPSTREAM=...).
ENV API_UPSTREAM=http://nodejs-backend-template:3000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/publish/wwwroot /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
