// Test di CORS e documentazione OpenAPI/Scalar.
using System.Net;

namespace DotnetBackendTemplate.Tests.Integration;

public sealed class InfrastructureEndpointsTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public InfrastructureEndpointsTests(ApiFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);
        _client = factory.CreateClient();
    }

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task CorsPreflight_FromAllowedOrigin_IsAccepted()
    {
        using var request = Preflight(ApiFactory.AllowedOrigin);

        var response = await _client.SendAsync(request, Ct);

        Assert.True(response.Headers.TryGetValues("Access-Control-Allow-Origin", out var values));
        Assert.Equal(ApiFactory.AllowedOrigin, Assert.Single(values));
    }

    [Fact]
    public async Task CorsPreflight_FromUnknownOrigin_IsNotAllowed()
    {
        using var request = Preflight("http://evil.example.com");

        var response = await _client.SendAsync(request, Ct);

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task OpenApiDocument_IsServed()
    {
        var response = await _client.GetAsync(new Uri("/openapi/v1.json", UriKind.Relative), Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var document = await response.ReadJsonAsync();
        Assert.True(document.GetProperty("paths").TryGetProperty("/api/items/{id}", out _));
    }

    [Fact]
    public async Task ScalarUi_IsServedOnDocs()
    {
        var response = await _client.GetAsync(new Uri("/docs", UriKind.Relative), Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
    }

    private static HttpRequestMessage Preflight(string origin)
    {
        var request = new HttpRequestMessage(HttpMethod.Options, new Uri("/api/items", UriKind.Relative));
        request.Headers.Add("Origin", origin);
        request.Headers.Add("Access-Control-Request-Method", "POST");
        return request;
    }
}
