// ProblemDetailsResponse: corpo degli errori (RFC 9457, application/problem+json).
// "errors" è presente solo per i 400 di validazione: campo -> lista di messaggi.
namespace CSharpFrontendTemplate.Models;

public sealed record ProblemDetailsResponse(
    string? Type,
    string? Title,
    int? Status,
    string? Detail,
    Dictionary<string, string[]>? Errors);
