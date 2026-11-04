// Gestore centralizzato delle eccezioni (IExceptionHandler, introdotto in .NET 8).
// Viene invocato da app.UseExceptionHandler() per qualsiasi eccezione non gestita.
using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace DotnetBackendTemplate.Api.ErrorHandling;

public sealed partial class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(httpContext);
        ArgumentNullException.ThrowIfNull(exception);

        var problem = exception switch
        {
            // Errore del client: JSON malformato, tipo sbagliato, body mancante, ...
            BadHttpRequestException badRequest => CreateBadRequestProblem(badRequest),
            // Errore inatteso: dettagli SOLO nei log, mai nella risposta.
            _ => CreateUnexpectedProblem(httpContext, exception),
        };

        httpContext.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
        }).ConfigureAwait(false);
    }

    private static ProblemDetails CreateBadRequestProblem(BadHttpRequestException exception)
    {
        if (exception.StatusCode != StatusCodes.Status400BadRequest)
        {
            // Es. 413 Payload Too Large: il titolo standard viene aggiunto da ASP.NET Core.
            return new ProblemDetails { Status = exception.StatusCode };
        }

        // Se il problema e un campo con tipo sbagliato (es. "price": "abc"), System.Text.Json
        // indica il percorso ("$.price"): lo usiamo come nome del campo nell'oggetto errors.
        var field = exception.InnerException is JsonException { Path: { Length: > 2 } path }
            ? path.TrimStart('$', '.')
            : null;

        var errors = field is null
            ? new Dictionary<string, string[]> { ["body"] = ["request body is missing or is not valid JSON"] }
            : new Dictionary<string, string[]> { [field] = [$"{field} has an invalid value"] };

        // HttpValidationProblemDetails = ProblemDetails + "errors" (campo -> lista di messaggi).
        return new HttpValidationProblemDetails(errors) { Status = StatusCodes.Status400BadRequest };
    }

    private ProblemDetails CreateUnexpectedProblem(HttpContext httpContext, Exception exception)
    {
        LogUnhandledException(logger, exception, httpContext.Request.Method, httpContext.Request.Path);
        return new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Internal Server Error",
            Detail = "An unexpected error occurred.",
        };
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled exception while processing {Method} {Path}")]
    private static partial void LogUnhandledException(ILogger logger, Exception exception, string method, string path);
}
