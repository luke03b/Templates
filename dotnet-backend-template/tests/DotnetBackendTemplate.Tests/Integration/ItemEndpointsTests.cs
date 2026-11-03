// Test di integrazione del CRUD /api/items: successi ed errori, formato del contratto.
using System.Net;
using System.Net.Http.Json;
using DotnetBackendTemplate.Contracts.Items;

namespace DotnetBackendTemplate.Tests.Integration;

// Ogni test riceve una nuova istanza della classe e quindi una nuova app con i soli 3 item seed:
// i test che modificano i dati non si influenzano a vicenda.
public sealed class ItemEndpointsTests : IAsyncDisposable
{
    private readonly ApiFactory _factory = new();
    private readonly HttpClient _client;

    public ItemEndpointsTests()
    {
        _client = _factory.CreateClient();
    }

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    public async ValueTask DisposeAsync()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
    }

    [Fact]
    public async Task List_ReturnsThreeSeedItemsOrderedByCreatedAt()
    {
        var items = await _client.GetFromJsonAsync<List<ItemResponse>>("/api/items", Ct);

        Assert.NotNull(items);
        Assert.Equal(3, items.Count);
        Assert.Equal(items.OrderBy(i => i.CreatedAt), items);
    }

    [Fact]
    public async Task List_UsesCamelCaseFieldNames()
    {
        var response = await _client.GetAsync("/api/items", Ct);
        var first = (await response.ReadJsonAsync())[0];

        foreach (var field in new[] { "id", "name", "description", "price", "createdAt", "updatedAt" })
        {
            Assert.True(first.TryGetProperty(field, out _), $"missing field {field}");
        }

        Assert.EndsWith("Z", first.GetProperty("createdAt").GetString(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task Get_ExistingItem_ReturnsItem()
    {
        var seed = await FirstSeedItemAsync();

        var item = await _client.GetFromJsonAsync<ItemResponse>($"/api/items/{seed.Id}", Ct);

        Assert.Equal(seed, item);
    }

    [Fact]
    public async Task Get_UnknownItem_Returns404ProblemDetails()
    {
        var response = await _client.GetAsync($"/api/items/{Guid.NewGuid()}", Ct);

        await AssertNotFoundProblemAsync(response);
    }

    [Fact]
    public async Task Get_NonUuidId_Returns404ProblemDetails()
    {
        var response = await _client.GetAsync("/api/items/not-a-uuid", Ct);

        await AssertNotFoundProblemAsync(response);
    }

    [Fact]
    public async Task Create_ValidInput_Returns201WithLocationAndTrimmedName()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/items",
            new { name = "  Desk lamp  ", description = "LED", price = 19.99 },
            Ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ItemResponse>(Ct);
        Assert.NotNull(created);
        Assert.Equal("Desk lamp", created.Name);
        Assert.Equal("LED", created.Description);
        Assert.Equal(19.99m, created.Price);
        Assert.Equal(4, created.Id.Version);
        Assert.Equal(_factory.Time.GetUtcNow().UtcDateTime, created.CreatedAt);
        Assert.Equal(created.CreatedAt, created.UpdatedAt);

        Assert.NotNull(response.Headers.Location);
        Assert.Equal($"/api/items/{created.Id}", response.Headers.Location.ToString());
        var fetched = await _client.GetFromJsonAsync<ItemResponse>(response.Headers.Location, Ct);
        Assert.Equal(created, fetched);
    }

    [Fact]
    public async Task Create_WithoutDescription_StoresNull()
    {
        var response = await _client.PostAsJsonAsync("/api/items", new { name = "Pen", price = 0 }, Ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ItemResponse>(Ct);
        Assert.Null(created?.Description);
    }

    [Fact]
    public async Task Create_MissingFields_Returns400WithContractErrors()
    {
        var response = await _client.PostAsJsonAsync("/api/items", new { }, Ct);

        var problem = await AssertValidationProblemAsync(response);
        Assert.Equal(["name is required"], problem.ErrorsFor("name"));
        Assert.Equal(["price is required"], problem.ErrorsFor("price"));
    }

    [Theory]
    [InlineData("name", "   ", "name is required")]
    [InlineData("name", "", "name is required")]
    [InlineData("price", -1, "price must be greater than or equal to 0")]
    [InlineData("price", -0.01, "price must be greater than or equal to 0")]
    public async Task Create_InvalidField_Returns400ForThatField(string field, object value, string expectedMessage)
    {
        var body = new Dictionary<string, object> { ["name"] = "Valid", ["price"] = 1 };
        body[field] = value;

        var response = await _client.PostAsJsonAsync("/api/items", body, Ct);

        var problem = await AssertValidationProblemAsync(response);
        Assert.Equal([expectedMessage], problem.ErrorsFor(field));
        Assert.Single(problem.GetProperty("errors").EnumerateObject());
    }

    [Fact]
    public async Task Create_TooLongValues_Returns400()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/items",
            new { name = new string('a', 101), description = new string('b', 501), price = 1 },
            Ct);

        var problem = await AssertValidationProblemAsync(response);
        Assert.Equal(["name must be between 1 and 100 characters"], problem.ErrorsFor("name"));
        Assert.Equal(["description must be at most 500 characters"], problem.ErrorsFor("description"));
    }

    [Fact]
    public async Task Create_MalformedJson_Returns400()
    {
        using var content = new StringContent("{ not json", System.Text.Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/items", content, Ct);

        var problem = await AssertValidationProblemAsync(response);
        Assert.NotEmpty(problem.ErrorsFor("body"));
    }

    [Fact]
    public async Task Create_WrongFieldType_Returns400ForThatField()
    {
        using var content = new StringContent("""{ "name": "Pen", "price": "free" }""", System.Text.Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/items", content, Ct);

        var problem = await AssertValidationProblemAsync(response);
        Assert.Equal(["price has an invalid value"], problem.ErrorsFor("price"));
    }

    [Fact]
    public async Task Update_ValidInput_Returns200AndRefreshesUpdatedAt()
    {
        var seed = await FirstSeedItemAsync();
        _factory.Time.Advance(TimeSpan.FromMinutes(5));

        var response = await _client.PutAsJsonAsync(
            $"/api/items/{seed.Id}",
            new { name = "Renamed", description = (string?)null, price = 5 },
            Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<ItemResponse>(Ct);
        Assert.NotNull(updated);
        Assert.Equal(seed.Id, updated.Id);
        Assert.Equal("Renamed", updated.Name);
        Assert.Null(updated.Description);
        Assert.Equal(5m, updated.Price);
        Assert.Equal(seed.CreatedAt, updated.CreatedAt);
        Assert.Equal(_factory.Time.GetUtcNow().UtcDateTime, updated.UpdatedAt);
    }

    [Fact]
    public async Task Update_InvalidInput_Returns400()
    {
        var seed = await FirstSeedItemAsync();

        var response = await _client.PutAsJsonAsync($"/api/items/{seed.Id}", new { name = "", price = -5 }, Ct);

        var problem = await AssertValidationProblemAsync(response);
        Assert.NotEmpty(problem.ErrorsFor("name"));
        Assert.NotEmpty(problem.ErrorsFor("price"));
    }

    [Fact]
    public async Task Update_UnknownItem_Returns404()
    {
        var response = await _client.PutAsJsonAsync($"/api/items/{Guid.NewGuid()}", new { name = "X", price = 1 }, Ct);

        await AssertNotFoundProblemAsync(response);
    }

    [Fact]
    public async Task Delete_ExistingItem_Returns204ThenItemIsGone()
    {
        var seed = await FirstSeedItemAsync();

        var response = await _client.DeleteAsync($"/api/items/{seed.Id}", Ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Empty(await response.Content.ReadAsByteArrayAsync(Ct));
        await AssertNotFoundProblemAsync(await _client.GetAsync($"/api/items/{seed.Id}", Ct));
    }

    [Fact]
    public async Task Delete_UnknownItem_Returns404()
    {
        var response = await _client.DeleteAsync($"/api/items/{Guid.NewGuid()}", Ct);

        await AssertNotFoundProblemAsync(response);
    }

    private async Task<ItemResponse> FirstSeedItemAsync()
    {
        var items = await _client.GetFromJsonAsync<List<ItemResponse>>("/api/items", Ct);
        Assert.NotNull(items);
        return items[0];
    }

    private static async Task<System.Text.Json.JsonElement> AssertValidationProblemAsync(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        var problem = await response.ReadJsonAsync();
        Assert.Equal("about:blank", problem.GetProperty("type").GetString());
        Assert.Equal("Validation failed", problem.GetProperty("title").GetString());
        Assert.Equal(400, problem.GetProperty("status").GetInt32());
        Assert.Equal("One or more fields are invalid.", problem.GetProperty("detail").GetString());
        return problem;
    }

    private static async Task AssertNotFoundProblemAsync(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        var problem = await response.ReadJsonAsync();
        Assert.Equal("about:blank", problem.GetProperty("type").GetString());
        Assert.Equal(404, problem.GetProperty("status").GetInt32());
        Assert.False(problem.TryGetProperty("errors", out _));
    }
}
