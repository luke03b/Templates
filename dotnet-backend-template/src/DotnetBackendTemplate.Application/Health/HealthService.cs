// Caso d'uso "stato del servizio": costruisce la risposta di GET /api/health.
using DotnetBackendTemplate.Contracts.Health;

namespace DotnetBackendTemplate.Application.Health;

public interface IHealthService
{
    HealthResponse GetHealth();
}

/// <summary>
/// TimeProvider (built-in da .NET 8) astrae l'orologio di sistema: in produzione usa
/// TimeProvider.System, nei test si sostituisce con FakeTimeProvider per avere date prevedibili.
/// </summary>
public sealed class HealthService(TimeProvider timeProvider) : IHealthService
{
    public const string ServiceName = "dotnet-backend-template";

    public HealthResponse GetHealth() =>
        new("ok", ServiceName, timeProvider.GetUtcNow().UtcDateTime);
}
