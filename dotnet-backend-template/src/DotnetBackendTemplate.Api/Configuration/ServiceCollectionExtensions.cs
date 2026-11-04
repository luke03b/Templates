// Metodi di estensione che tengono Program.cs corto: ogni funzionalita trasversale
// (logging, CORS, Problem Details, OpenAPI) e configurata in un punto solo.
using System.Text.Json;
using DotnetBackendTemplate.Api.ErrorHandling;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace DotnetBackendTemplate.Api.Configuration;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Log leggibili su una riga in sviluppo, JSON strutturato (una riga = un oggetto JSON)
    /// negli altri ambienti, pronto per Docker/Kubernetes e strumenti come Loki, ELK, Datadog.
    /// </summary>
    public static WebApplicationBuilder AddStructuredLogging(this WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.Logging.ClearProviders();
        if (builder.Environment.IsDevelopment())
        {
            builder.Logging.AddSimpleConsole(options =>
            {
                options.SingleLine = true;
                options.TimestampFormat = "HH:mm:ss ";
            });
        }
        else
        {
            builder.Logging.AddJsonConsole(options =>
            {
                options.UseUtcTimestamp = true;
                options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ";
                options.IncludeScopes = true;
            });
        }

        // Livello minimo da LOG_LEVEL. Le regole per categoria in appsettings.json
        // (es. "Microsoft.AspNetCore": "Warning") restano piu specifiche e hanno la precedenza.
        builder.Logging.SetMinimumLevel(ApiSettings.GetLogLevel(builder.Configuration));
        return builder;
    }

    /// <summary>CORS con origini lette da CORS_ORIGINS ("*" = qualsiasi origine).</summary>
    public static IServiceCollection AddConfiguredCors(this IServiceCollection services)
    {
        services.AddCors();

        // Configure<IConfiguration> legge la configurazione quando le opzioni servono davvero
        // (non durante l'avvio), cosi anche i test possono sovrascrivere CORS_ORIGINS.
        services.AddOptions<CorsOptions>().Configure<IConfiguration>((options, configuration) =>
        {
            var origins = ApiSettings.GetCorsOrigins(configuration);
            options.AddDefaultPolicy(policy =>
            {
                if (origins.Contains("*"))
                {
                    policy.AllowAnyOrigin();
                }
                else
                {
                    policy.WithOrigins([.. origins]);
                }

                // Location serve ai frontend per leggere l'URL dell'item appena creato.
                policy.AllowAnyHeader().AllowAnyMethod().WithExposedHeaders("Location");
            });
        });
        return services;
    }

    /// <summary>
    /// Problem Details (RFC 9457) per TUTTI gli errori: validazione, 404, 500, rotte inesistenti.
    /// CustomizeProblemDetails viene chiamato per ogni risposta di errore e la allinea al contratto.
    /// </summary>
    public static IServiceCollection AddContractProblemDetails(this IServiceCollection services)
    {
        services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
        {
            var problem = context.ProblemDetails;
            problem.Type = "about:blank";

            if (problem is HttpValidationProblemDetails validation && problem.Status == StatusCodes.Status400BadRequest)
            {
                problem.Title = "Validation failed";
                problem.Detail = "One or more fields are invalid.";
                // La validazione usa i nomi C# (Name, Price): il contratto vuole camelCase (name, price).
                ToCamelCaseKeys(validation.Errors);
            }

            // ASP.NET Core aggiunge anche "traceId": permette di ritrovare l'errore nei log.
        });

        // Gestore globale delle eccezioni (500 senza dettagli interni, JSON malformato -> 400).
        services.AddExceptionHandler<GlobalExceptionHandler>();

        // Con ThrowOnBadRequest gli errori di binding (JSON malformato, body mancante)
        // diventano eccezioni gestite da GlobalExceptionHandler, che risponde col formato del contratto.
        services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = true);
        return services;
    }

    private static void ToCamelCaseKeys(IDictionary<string, string[]> errors)
    {
        var entries = errors.ToList();
        errors.Clear();
        foreach (var (key, messages) in entries)
        {
            // "Address.Street" -> "address.street"; le chiavi gia in camelCase restano invariate.
            var camelKey = string.Join('.', key.Split('.').Select(JsonNamingPolicy.CamelCase.ConvertName));
            errors[camelKey] = errors.TryGetValue(camelKey, out var existing) ? [.. existing, .. messages] : messages;
        }
    }

    public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        // OpenAPI nativo di ASP.NET Core: il documento e generato da endpoint, tipi e commenti XML.
        services.AddOpenApi(options => options.AddDocumentTransformer((document, _, _) =>
        {
            document.Info.Title = "dotnet-backend-template API";
            document.Info.Version = "v1";
            document.Info.Description = "Common API contract: health check and in-memory CRUD for items.";
            return Task.CompletedTask;
        }));
        return services;
    }
}
