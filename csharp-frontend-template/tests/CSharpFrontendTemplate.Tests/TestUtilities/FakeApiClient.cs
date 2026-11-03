// FakeApiClient: implementazione in memoria di IApiClient per i test delle PAGINE.
// Le pagine dipendono dall'interfaccia, quindi nei test la si sostituisce con questa.
using CSharpFrontendTemplate.Models;
using CSharpFrontendTemplate.Services;

namespace CSharpFrontendTemplate.Tests.TestUtilities;

public sealed class FakeApiClient : IApiClient
{
    public List<Item> Items { get; } = [];

    /// <summary>Se impostata, ogni chiamata lancia questa eccezione (simula errori del backend).</summary>
    public ApiException? NextError { get; set; }

    public HealthResponse Health { get; set; } = new("ok", "fake-backend", DateTimeOffset.UtcNow);

    public List<string> DeletedIds { get; } = [];

    public static Item CreateItem(string id, string name, decimal price = 10m) =>
        new(id, name, null, price, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    public Task<HealthResponse> GetHealthAsync(CancellationToken cancellationToken = default) => Run(() => Health);

    public Task<IReadOnlyList<Item>> GetItemsAsync(CancellationToken cancellationToken = default) =>
        Run<IReadOnlyList<Item>>(() => [.. Items]);

    public Task<Item> GetItemAsync(string id, CancellationToken cancellationToken = default) =>
        Run(() => Items.Single(i => i.Id == id));

    public Task<Item> CreateItemAsync(ItemInput input, CancellationToken cancellationToken = default) => Run(() =>
    {
        var item = CreateItem(Guid.NewGuid().ToString(), input.Name, input.Price ?? 0);
        Items.Add(item);
        return item;
    });

    public Task<Item> UpdateItemAsync(string id, ItemInput input, CancellationToken cancellationToken = default) => Run(() =>
    {
        var index = Items.FindIndex(i => i.Id == id);
        Items[index] = Items[index] with { Name = input.Name, Price = input.Price ?? 0 };
        return Items[index];
    });

    public Task DeleteItemAsync(string id, CancellationToken cancellationToken = default) => Run(() =>
    {
        DeletedIds.Add(id);
        return Items.RemoveAll(i => i.Id == id);
    });

    private Task<T> Run<T>(Func<T> action)
    {
        if (NextError is { } error)
        {
            return Task.FromException<T>(error);
        }

        return Task.FromResult(action());
    }
}
