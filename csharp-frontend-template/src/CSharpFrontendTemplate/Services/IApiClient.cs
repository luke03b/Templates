// IApiClient: contratto del client verso il backend. Le pagine dipendono dall'interfaccia,
// non dall'implementazione: nei test di pagina si registra un'implementazione finta.
using CSharpFrontendTemplate.Models;

namespace CSharpFrontendTemplate.Services;

public interface IApiClient
{
    Task<HealthResponse> GetHealthAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Item>> GetItemsAsync(CancellationToken cancellationToken = default);

    Task<Item> GetItemAsync(string id, CancellationToken cancellationToken = default);

    Task<Item> CreateItemAsync(ItemInput input, CancellationToken cancellationToken = default);

    Task<Item> UpdateItemAsync(string id, ItemInput input, CancellationToken cancellationToken = default);

    Task DeleteItemAsync(string id, CancellationToken cancellationToken = default);
}
