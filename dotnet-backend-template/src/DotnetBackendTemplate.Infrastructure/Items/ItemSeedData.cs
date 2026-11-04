// Dati di esempio caricati all'avvio, cosi i frontend mostrano subito qualcosa.
using DotnetBackendTemplate.Application.Items;

namespace DotnetBackendTemplate.Infrastructure.Items;

public static class ItemSeedData
{
    /// <summary>
    /// Tre item con date di creazione distinte (a distanza di un minuto), cosi l'ordinamento
    /// per createdAt e stabile e prevedibile.
    /// </summary>
    public static IReadOnlyList<Item> Create(TimeProvider timeProvider)
    {
        ArgumentNullException.ThrowIfNull(timeProvider);
        var now = timeProvider.GetUtcNow().UtcDateTime;

        return
        [
            NewItem("Keyboard", "Mechanical keyboard with brown switches", 89.90m, now.AddMinutes(-3)),
            NewItem("Mouse", "Wireless ergonomic mouse", 39.50m, now.AddMinutes(-2)),
            NewItem("Monitor", null, 249.00m, now.AddMinutes(-1)),
        ];
    }

    private static Item NewItem(string name, string? description, decimal price, DateTime createdAt) =>
        new(Guid.NewGuid(), name, description, price, createdAt, createdAt);
}
