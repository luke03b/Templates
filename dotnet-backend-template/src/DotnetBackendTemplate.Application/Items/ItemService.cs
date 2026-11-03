// Logica di business degli item: normalizzazione dell'input, id e date, mapping verso il DTO.
using DotnetBackendTemplate.Contracts.Items;
using Microsoft.Extensions.Logging;

namespace DotnetBackendTemplate.Application.Items;

/// <summary>
/// "partial" serve al source generator di [LoggerMessage] (in fondo al file), che genera
/// metodi di log strutturati e senza allocazioni inutili.
/// Il costruttore primario (ItemService(...)) riceve le dipendenze tramite dependency injection:
/// e il container di ASP.NET Core a creare l'istanza passando repository, orologio e logger.
/// </summary>
public sealed partial class ItemService(
    IItemRepository repository,
    TimeProvider timeProvider,
    ILogger<ItemService> logger) : IItemService
{
    public async Task<IReadOnlyList<ItemResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        var items = await repository.ListAsync(cancellationToken).ConfigureAwait(false);
        return [.. items.Select(ToResponse)];
    }

    public async Task<ItemResponse?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await repository.GetByIdAsync(id, cancellationToken).ConfigureAwait(false);
        return item is null ? null : ToResponse(item);
    }

    public async Task<ItemResponse> CreateAsync(ItemRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var item = new Item(
            Id: Guid.NewGuid(),
            Name: NormalizeName(request.Name),
            Description: NormalizeDescription(request.Description),
            Price: request.Price ?? 0m,
            CreatedAt: now,
            UpdatedAt: now);

        await repository.AddAsync(item, cancellationToken).ConfigureAwait(false);
        LogItemCreated(logger, item.Id);
        return ToResponse(item);
    }

    public async Task<ItemResponse?> UpdateAsync(Guid id, ItemRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var existing = await repository.GetByIdAsync(id, cancellationToken).ConfigureAwait(false);
        if (existing is null)
        {
            return null;
        }

        // "with" crea una copia del record cambiando solo i campi indicati.
        var updated = existing with
        {
            Name = NormalizeName(request.Name),
            Description = NormalizeDescription(request.Description),
            Price = request.Price ?? 0m,
            UpdatedAt = timeProvider.GetUtcNow().UtcDateTime,
        };

        if (!await repository.UpdateAsync(updated, cancellationToken).ConfigureAwait(false))
        {
            // L'item e stato eliminato da un'altra richiesta nel frattempo.
            return null;
        }

        LogItemUpdated(logger, id);
        return ToResponse(updated);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var deleted = await repository.DeleteAsync(id, cancellationToken).ConfigureAwait(false);
        if (deleted)
        {
            LogItemDeleted(logger, id);
        }

        return deleted;
    }

    // La validazione HTTP garantisce gia che name non sia vuoto: qui normalizziamo soltanto.
    private static string NormalizeName(string? name) => (name ?? string.Empty).Trim();

    // Una descrizione fatta solo di spazi viene salvata come null.
    private static string? NormalizeDescription(string? description) =>
        string.IsNullOrWhiteSpace(description) ? null : description.Trim();

    private static ItemResponse ToResponse(Item item) =>
        new(item.Id, item.Name, item.Description, item.Price, item.CreatedAt, item.UpdatedAt);

    // Log strutturati: {ItemId} diventa un campo separato nei log JSON, filtrabile e ricercabile.
    [LoggerMessage(Level = LogLevel.Information, Message = "Item {ItemId} created")]
    private static partial void LogItemCreated(ILogger logger, Guid itemId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Item {ItemId} updated")]
    private static partial void LogItemUpdated(ILogger logger, Guid itemId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Item {ItemId} deleted")]
    private static partial void LogItemDeleted(ILogger logger, Guid itemId);
}
