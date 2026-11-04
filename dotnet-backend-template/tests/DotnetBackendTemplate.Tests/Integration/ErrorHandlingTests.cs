// Test del gestore globale degli errori: un'eccezione inattesa diventa un 500 generico.
using System.Net;
using DotnetBackendTemplate.Application.Items;
using DotnetBackendTemplate.Contracts.Items;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DotnetBackendTemplate.Tests.Integration;

public sealed class ErrorHandlingTests : IClassFixture<ApiFactory>
{
    private const string SecretMessage = "database password is hunter2";

    private readonly ApiFactory _factory;

    public ErrorHandlingTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task UnhandledException_Returns500WithoutLeakingDetails()
    {
        // WithWebHostBuilder crea una variante dell'app con un service che lancia sempre.
        using var factory = _factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IItemService>();
            services.AddScoped<IItemService, ThrowingItemService>();
        }));
        using var client = factory.CreateClient();

        var response = await client.GetAsync(new Uri("/api/items", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var raw = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.DoesNotContain(SecretMessage, raw, StringComparison.Ordinal);
        Assert.DoesNotContain("ThrowingItemService", raw, StringComparison.Ordinal);

        var problem = await response.ReadJsonAsync();
        Assert.Equal("An unexpected error occurred.", problem.GetProperty("detail").GetString());
        Assert.Equal(500, problem.GetProperty("status").GetInt32());
    }

    [Fact]
    public async Task UnknownRoute_Returns404ProblemDetails()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync(new Uri("/api/does-not-exist", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    private sealed class ThrowingItemService : IItemService
    {
        public Task<IReadOnlyList<ItemResponse>> ListAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException(SecretMessage);

        public Task<ItemResponse?> GetAsync(Guid id, CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException(SecretMessage);

        public Task<ItemResponse> CreateAsync(ItemRequest request, CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException(SecretMessage);

        public Task<ItemResponse?> UpdateAsync(Guid id, ItemRequest request, CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException(SecretMessage);

        public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException(SecretMessage);
    }
}
