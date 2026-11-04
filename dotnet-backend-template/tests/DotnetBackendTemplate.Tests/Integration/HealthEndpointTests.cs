// Test di integrazione di GET /api/health.
using System.Net;

namespace DotnetBackendTemplate.Tests.Integration;

public sealed class HealthEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(ApiFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsOkWithContractBody()
    {
        var response = await _client.GetAsync(new Uri("/api/health", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);

        var body = await response.ReadJsonAsync();
        Assert.Equal("ok", body.GetProperty("status").GetString());
        Assert.Equal("dotnet-backend-template", body.GetProperty("service").GetString());
        Assert.Equal("2026-11-03T18:00:00Z", body.GetProperty("timestamp").GetString());
    }
}
