// Modello di dominio dell'item: e cio che il repository salva. Non e esposto direttamente
// dall'API (l'API usa ItemResponse), cosi storage e contratto possono evolvere separatamente.
namespace DotnetBackendTemplate.Application.Items;

/// <summary>Item immutabile: per modificarlo si crea una copia con l'espressione "with".</summary>
public sealed record Item(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    DateTime CreatedAt,
    DateTime UpdatedAt);
