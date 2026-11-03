// DTO di risposta di GET /api/health (vedi docs/api-contract.md).
namespace DotnetBackendTemplate.Contracts.Health;

/// <summary>Stato del servizio.</summary>
/// <param name="Status">Sempre "ok" se il processo risponde.</param>
/// <param name="Service">Nome del servizio.</param>
/// <param name="Timestamp">Istante della risposta in UTC (ISO 8601, suffisso Z).</param>
// "record" = tipo immutabile con uguaglianza per valore: ideale per i DTO.
public sealed record HealthResponse(string Status, string Service, DateTime Timestamp);
