// HealthResponse: risposta di GET /api/health.
namespace CSharpFrontendTemplate.Models;

public sealed record HealthResponse(string Status, string Service, DateTimeOffset Timestamp);
