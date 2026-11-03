// Endpoint GET /api/health. Le Minimal API definiscono le rotte con MapGet/MapPost/...
// raggruppate per risorsa in metodi di estensione come questo.
using DotnetBackendTemplate.Application.Health;
using DotnetBackendTemplate.Contracts.Health;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DotnetBackendTemplate.Api.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder routes)
    {
        routes.MapGet("/health", GetHealth)
            .WithName("GetHealth")
            .WithTags("Health")
            .WithSummary("Service health status");
        return routes;
    }

    // I parametri dell'handler vengono risolti automaticamente: qui IHealthService arriva dalla DI.
    // TypedResults.Ok<T> documenta da solo in OpenAPI la risposta 200 con il tipo HealthResponse.
    private static Ok<HealthResponse> GetHealth(IHealthService healthService) =>
        TypedResults.Ok(healthService.GetHealth());
}
