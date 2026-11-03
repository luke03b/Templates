// Test dell'ApiClient: verificano URL, metodo, corpo JSON e la mappatura degli errori
// (Problem Details, 404, rete) usando FakeHttpMessageHandler al posto della rete.
using System.Net;
using CSharpFrontendTemplate.Models;
using CSharpFrontendTemplate.Services;
using CSharpFrontendTemplate.Tests.TestUtilities;

namespace CSharpFrontendTemplate.Tests.Services;

public sealed class ApiClientTests
{
    private const string ItemJson = """
        {"id":"1","name":"Keyboard","description":null,"price":49.9,"createdAt":"2026-11-03T18:00:00Z","updatedAt":"2026-11-03T18:00:00Z"}
        """;

    // Token di cancellazione del test corrente (xUnit v3): annulla le chiamate se il test va in timeout.
    private static CancellationToken Ct => Xunit.TestContext.Current.CancellationToken;

    [Fact]
    public async Task GetHealthAsync_ReturnsParsedResponse()
    {
        var client = FakeHttpMessageHandler.CreateClient(
            _ => FakeHttpMessageHandler.Json(HttpStatusCode.OK, """{"status":"ok","service":"nodejs-backend-template","timestamp":"2026-11-03T18:00:00Z"}"""),
            out var handler);

        var health = await new ApiClient(client).GetHealthAsync(Ct);

        Assert.Equal("ok", health.Status);
        Assert.Equal("nodejs-backend-template", health.Service);
        Assert.Equal("http://localhost:3000/api/health", handler.Requests.Single().Uri.ToString());
    }

    [Fact]
    public async Task GetItemsAsync_ReturnsItems()
    {
        var client = FakeHttpMessageHandler.CreateClient(
            _ => FakeHttpMessageHandler.Json(HttpStatusCode.OK, $"[{ItemJson}]"),
            out var handler);

        var items = await new ApiClient(client).GetItemsAsync(Ct);

        var item = Assert.Single(items);
        Assert.Equal("Keyboard", item.Name);
        Assert.Equal(49.9m, item.Price);
        Assert.Equal(HttpMethod.Get, handler.Requests.Single().Method);
    }

    [Fact]
    public async Task CreateItemAsync_PostsCamelCaseTrimmedBody()
    {
        var client = FakeHttpMessageHandler.CreateClient(
            _ => FakeHttpMessageHandler.Json(HttpStatusCode.Created, ItemJson),
            out var handler);

        var created = await new ApiClient(client).CreateItemAsync(
            new ItemInput { Name = "  Keyboard  ", Description = " ", Price = 49.9m },
            Ct);

        var request = handler.Requests.Single();
        Assert.Equal(HttpMethod.Post, request.Method);
        Assert.Equal("/api/items", request.Uri.AbsolutePath);
        Assert.Equal("""{"name":"Keyboard","description":null,"price":49.9}""", request.Body);
        Assert.Equal("1", created.Id);
    }

    [Fact]
    public async Task UpdateItemAsync_PutsToItemUrl()
    {
        var client = FakeHttpMessageHandler.CreateClient(
            _ => FakeHttpMessageHandler.Json(HttpStatusCode.OK, ItemJson),
            out var handler);

        await new ApiClient(client).UpdateItemAsync("abc 1", new ItemInput { Name = "Keyboard", Price = 1 }, Ct);

        var request = handler.Requests.Single();
        Assert.Equal(HttpMethod.Put, request.Method);
        Assert.Equal("/api/items/abc%201", request.Uri.AbsolutePath);
    }

    [Fact]
    public async Task DeleteItemAsync_AcceptsNoContent()
    {
        var client = FakeHttpMessageHandler.CreateClient(_ => new HttpResponseMessage(HttpStatusCode.NoContent), out var handler);

        await new ApiClient(client).DeleteItemAsync("1", Ct);

        Assert.Equal(HttpMethod.Delete, handler.Requests.Single().Method);
    }

    [Fact]
    public async Task CreateItemAsync_ValidationProblem_ThrowsWithFieldErrors()
    {
        const string problem = """
            {"type":"about:blank","title":"Validation failed","status":400,"detail":"One or more fields are invalid.",
             "errors":{"name":["name is required"],"price":["price must be greater than or equal to 0"]}}
            """;
        var client = FakeHttpMessageHandler.CreateClient(
            _ => FakeHttpMessageHandler.Json(HttpStatusCode.BadRequest, problem, "application/problem+json"),
            out _);

        var ex = await Assert.ThrowsAsync<ApiException>(() =>
            new ApiClient(client).CreateItemAsync(new ItemInput(), Ct));

        Assert.True(ex.IsValidationError);
        Assert.Equal("One or more fields are invalid.", ex.Message);
        Assert.Equal(["name is required"], ex.ValidationErrors["name"]);
        Assert.Equal(["price must be greater than or equal to 0"], ex.ValidationErrors["price"]);
    }

    [Fact]
    public async Task GetItemAsync_NotFound_ThrowsNotFound()
    {
        var client = FakeHttpMessageHandler.CreateClient(
            _ => FakeHttpMessageHandler.Json(HttpStatusCode.NotFound, """{"title":"Not Found","status":404,"detail":"Item not found"}""", "application/problem+json"),
            out _);

        var ex = await Assert.ThrowsAsync<ApiException>(() => new ApiClient(client).GetItemAsync("missing", Ct));

        Assert.True(ex.IsNotFound);
        Assert.False(ex.IsValidationError);
        Assert.Equal("Item not found", ex.Message);
    }

    [Fact]
    public async Task ServerErrorWithoutJson_ThrowsGenericMessage()
    {
        var client = FakeHttpMessageHandler.CreateClient(
            _ => FakeHttpMessageHandler.Json(HttpStatusCode.BadGateway, "<html>Bad gateway</html>", "text/html"),
            out _);

        var ex = await Assert.ThrowsAsync<ApiException>(() => new ApiClient(client).GetItemsAsync(Ct));

        Assert.Equal(HttpStatusCode.BadGateway, ex.StatusCode);
        Assert.Null(ex.Problem);
        Assert.Equal("The server encountered an unexpected error.", ex.Message);
    }

    [Fact]
    public async Task NetworkFailure_ThrowsWithoutStatusCode()
    {
        var client = FakeHttpMessageHandler.CreateClient(_ => throw new HttpRequestException("Connection refused"), out _);

        var ex = await Assert.ThrowsAsync<ApiException>(() => new ApiClient(client).GetHealthAsync(Ct));

        Assert.Null(ex.StatusCode);
        Assert.IsType<HttpRequestException>(ex.InnerException);
    }
}
