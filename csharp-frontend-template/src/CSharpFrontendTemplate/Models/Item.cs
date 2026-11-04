// Item: DTO di OUTPUT restituito dal backend (vedi docs/api-contract.md).
// "record" = tipo immutabile con uguaglianza per valore: perfetto per dati letti da un'API.
namespace CSharpFrontendTemplate.Models;

public sealed record Item(
    string Id,
    string Name,
    string? Description,
    decimal Price,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
