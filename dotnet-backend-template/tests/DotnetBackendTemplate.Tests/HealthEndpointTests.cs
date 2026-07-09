using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace DotnetBackendTemplate.Tests;

public sealed class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsUpResponse()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();

        Assert.Contains("UP", body);
        Assert.Contains("NET backend template is running", body);
    }
}
