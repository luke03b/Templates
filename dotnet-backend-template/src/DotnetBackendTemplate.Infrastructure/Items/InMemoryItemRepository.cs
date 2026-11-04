// Implementazione in memoria di IItemRepository: i dati si perdono al riavvio del processo.
using System.Collections.Concurrent;
using DotnetBackendTemplate.Application.Items;

namespace DotnetBackendTemplate.Infrastructure.Items;

/// <summary>
/// Registrato come singleton (una sola istanza per tutta l'app), quindi usato da piu richieste
/// in parallelo: ConcurrentDictionary rende sicure letture e scritture concorrenti.
/// Gli Item sono record immutabili, quindi restituirli direttamente non espone lo stato interno.
/// </summary>
public sealed class InMemoryItemRepository : IItemRepository
{
    private readonly ConcurrentDictionary<Guid, Item> _items = new();

    public InMemoryItemRepository()
    {
    }

    public InMemoryItemRepository(IEnumerable<Item> initialItems)
    {
        ArgumentNullException.ThrowIfNull(initialItems);
        foreach (var item in initialItems)
        {
            _items[item.Id] = item;
        }
    }

    public Task<IReadOnlyList<Item>> ListAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Item> result = [.. _items.Values.OrderBy(item => item.CreatedAt).ThenBy(item => item.Id)];
        return Task.FromResult(result);
    }

    public Task<Item?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        Task.FromResult(_items.TryGetValue(id, out var item) ? item : null);

    public Task AddAsync(Item item, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(item);
        if (!_items.TryAdd(item.Id, item))
        {
            throw new InvalidOperationException($"An item with id '{item.Id}' already exists.");
        }

        return Task.CompletedTask;
    }

    public Task<bool> UpdateAsync(Item item, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(item);

        // Aggiorna solo se la chiave esiste ancora (evita di "resuscitare" un item eliminato).
        while (_items.TryGetValue(item.Id, out var current))
        {
            if (_items.TryUpdate(item.Id, item, current))
            {
                return Task.FromResult(true);
            }
        }

        return Task.FromResult(false);
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default) =>
        Task.FromResult(_items.TryRemove(id, out _));
}
