// "Porta" verso lo storage degli item. L'interfaccia vive nel layer Application e
// l'implementazione nel layer Infrastructure (dependency inversion): per passare a un
// database vero basta scrivere una nuova classe che implementa questa interfaccia.
namespace DotnetBackendTemplate.Application.Items;

public interface IItemRepository
{
    /// <summary>Tutti gli item ordinati per data di creazione crescente.</summary>
    Task<IReadOnlyList<Item>> ListAsync(CancellationToken cancellationToken = default);

    Task<Item?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Item item, CancellationToken cancellationToken = default);

    /// <summary>Sostituisce l'item con lo stesso Id. Restituisce false se non esiste.</summary>
    Task<bool> UpdateAsync(Item item, CancellationToken cancellationToken = default);

    /// <summary>Elimina l'item. Restituisce false se non esiste.</summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
