// Casi d'uso della risorsa items, usati dagli endpoint HTTP.
using DotnetBackendTemplate.Contracts.Items;

namespace DotnetBackendTemplate.Application.Items;

/// <summary>
/// I metodi restituiscono null / false quando l'item non esiste: e l'endpoint a tradurre
/// questo risultato in un 404, cosi il service resta indipendente da HTTP.
/// </summary>
public interface IItemService
{
    Task<IReadOnlyList<ItemResponse>> ListAsync(CancellationToken cancellationToken = default);

    Task<ItemResponse?> GetAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ItemResponse> CreateAsync(ItemRequest request, CancellationToken cancellationToken = default);

    Task<ItemResponse?> UpdateAsync(Guid id, ItemRequest request, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
