// DTO di output della risorsa items ("Item" nel contratto).
namespace DotnetBackendTemplate.Contracts.Items;

/// <summary>Item restituito dall'API.</summary>
/// <param name="Id">UUID v4 generato dal server.</param>
/// <param name="Name">Nome (gia normalizzato con trim).</param>
/// <param name="Description">Descrizione o null.</param>
/// <param name="Price">Prezzo, maggiore o uguale a 0.</param>
/// <param name="CreatedAt">Data di creazione in UTC.</param>
/// <param name="UpdatedAt">Data dell'ultimo aggiornamento in UTC.</param>
public sealed record ItemResponse(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    DateTime CreatedAt,
    DateTime UpdatedAt);
