// Punto di ingresso dell'applicazione: configura i servizi (dependency injection),
// la pipeline HTTP (middleware) e registra gli endpoint. Usa i "top-level statements" di C#:
// niente classe/metodo Main espliciti, il compilatore li genera.
using DotnetBackendTemplate.Api;
using DotnetBackendTemplate.Api.Configuration;
using DotnetBackendTemplate.Api.Endpoints;
using DotnetBackendTemplate.Application;
using DotnetBackendTemplate.Infrastructure;
using Scalar.AspNetCore;

// Modalita sonda per l'HEALTHCHECK Docker: interroga l'istanza gia in esecuzione ed esce.
if (args.Contains(HealthProbe.Argument))
{
    return await HealthProbe.RunAsync();
}

// Carica il file .env (se esiste, cercandolo anche nelle cartelle superiori) come variabili
// d'ambiente. NoClobber = le variabili gia impostate (shell, Docker, CI) vincono sul file.
DotNetEnv.Env.NoClobber().TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);
var port = ApiSettings.GetPort(builder.Configuration);

// Ascolta in HTTP su tutte le interfacce alla porta PORT. Niente HTTPS/UseHttpsRedirection:
// in container e in produzione il TLS e gestito dal reverse proxy / ingress davanti all'app.
builder.WebHost.UseUrls($"http://+:{port}");

// ---- Servizi (registrati nel container di dependency injection) ----
builder.AddStructuredLogging();
builder.Services.AddConfiguredCors();
builder.Services.AddContractProblemDetails();
builder.Services.AddValidation(); // validazione built-in di .NET 10 (DataAnnotations sui DTO)
builder.Services.AddApiDocumentation();
builder.Services.AddApplication();
builder.Services.AddInfrastructure();

var app = builder.Build();

// ---- Pipeline HTTP: i middleware vengono eseguiti nell'ordine in cui sono aggiunti ----
app.UseExceptionHandler(); // eccezioni -> GlobalExceptionHandler -> Problem Details
app.UseStatusCodePages();  // 404/405 senza corpo (es. rotta inesistente) -> Problem Details
app.UseCors();

// ---- Documentazione API ----
app.MapOpenApi();                  // documento JSON: /openapi/v1.json
app.MapScalarApiReference("/docs"); // UI interattiva: /docs
app.MapGet("/", () => TypedResults.Redirect("/docs")).ExcludeFromDescription();

// ---- Endpoint: tutte le rotte sotto il prefisso /api ----
var api = app.MapGroup("/api");
api.MapHealthEndpoints();
api.MapItemEndpoints();

await app.RunAsync();
return 0;

// Rende la classe Program (generata dai top-level statements) visibile ai test di integrazione,
// che la usano con WebApplicationFactory<Program>.
public partial class Program;
