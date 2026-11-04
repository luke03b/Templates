// ApiClient: UNICO punto dell'app che parla HTTP con il backend.
// Usa HttpClient + le estensioni di System.Net.Http.Json (GetFromJsonAsync, PostAsJsonAsync...)
// e converte ogni errore (HTTP, rete, JSON) in ApiException con il Problem Details del backend.
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CSharpFrontendTemplate.Models;

namespace CSharpFrontendTemplate.Services;

// "Primary constructor" (C# 12): il parametro httpClient è disponibile in tutta la classe.
public sealed class ApiClient(HttpClient httpClient) : IApiClient
{
    // Percorsi RELATIVI (senza "/" iniziale) così si combinano con BaseAddress.
    private const string HealthPath = "api/health";
    private const string ItemsPath = "api/items";

    // JsonSerializerDefaults.Web = camelCase e confronto dei nomi case-insensitive.
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public Task<HealthResponse> GetHealthAsync(CancellationToken cancellationToken = default) =>
        SendAsync<HealthResponse>(() => httpClient.GetAsync(HealthPath, cancellationToken), cancellationToken);

    public async Task<IReadOnlyList<Item>> GetItemsAsync(CancellationToken cancellationToken = default) =>
        await SendAsync<List<Item>>(() => httpClient.GetAsync(ItemsPath, cancellationToken), cancellationToken);

    public Task<Item> GetItemAsync(string id, CancellationToken cancellationToken = default) =>
        SendAsync<Item>(() => httpClient.GetAsync(ItemPath(id), cancellationToken), cancellationToken);

    public Task<Item> CreateItemAsync(ItemInput input, CancellationToken cancellationToken = default) =>
        SendAsync<Item>(
            () => httpClient.PostAsJsonAsync(ItemsPath, ToBody(input), JsonOptions, cancellationToken),
            cancellationToken);

    public Task<Item> UpdateItemAsync(string id, ItemInput input, CancellationToken cancellationToken = default) =>
        SendAsync<Item>(
            () => httpClient.PutAsJsonAsync(ItemPath(id), ToBody(input), JsonOptions, cancellationToken),
            cancellationToken);

    public async Task DeleteItemAsync(string id, CancellationToken cancellationToken = default)
    {
        using var response = await SendRawAsync(() => httpClient.DeleteAsync(ItemPath(id), cancellationToken));
        await EnsureSuccessAsync(response, cancellationToken);
    }

    private static string ItemPath(string id) => $"{ItemsPath}/{Uri.EscapeDataString(id)}";

    // Corpo esattamente come da contratto: { name, description, price }.
    private static object ToBody(ItemInput input)
    {
        var normalized = input.Normalized();
        return new { name = normalized.Name, description = normalized.Description, price = normalized.Price };
    }

    private static async Task<T> SendAsync<T>(Func<Task<HttpResponseMessage>> send, CancellationToken cancellationToken)
    {
        using var response = await SendRawAsync(send);
        await EnsureSuccessAsync(response, cancellationToken);
        try
        {
            return await response.Content.ReadFromJsonAsync<T>(JsonOptions, cancellationToken)
                ?? throw new ApiException(response.StatusCode, "The server returned an empty response.");
        }
        catch (JsonException ex)
        {
            throw new ApiException(response.StatusCode, "The server returned an invalid response.", innerException: ex);
        }
    }

    // Le eccezioni di rete (backend spento, CORS bloccato, DNS...) diventano ApiException senza status.
    private static async Task<HttpResponseMessage> SendRawAsync(Func<Task<HttpResponseMessage>> send)
    {
        try
        {
            return await send();
        }
        catch (HttpRequestException ex)
        {
            throw new ApiException(null, "Unable to reach the server. Check that the backend is running.", innerException: ex);
        }
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var problem = await TryReadProblemAsync(response, cancellationToken);
        var message = problem?.Detail ?? problem?.Title ?? DefaultMessage(response.StatusCode);
        throw new ApiException(response.StatusCode, message, problem);
    }

    // Prova a leggere il Problem Details; se il corpo non è JSON (es. pagina HTML di un proxy) restituisce null.
    private static async Task<ProblemDetailsResponse?> TryReadProblemAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        var mediaType = response.Content.Headers.ContentType?.MediaType;
        if (mediaType is not ("application/problem+json" or "application/json"))
        {
            return null;
        }

        try
        {
            return await response.Content.ReadFromJsonAsync<ProblemDetailsResponse>(JsonOptions, cancellationToken);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string DefaultMessage(HttpStatusCode statusCode) => statusCode switch
    {
        HttpStatusCode.BadRequest => "The request is invalid.",
        HttpStatusCode.NotFound => "The requested resource was not found.",
        _ when (int)statusCode >= 500 => "The server encountered an unexpected error.",
        _ => $"The request failed with status {(int)statusCode}.",
    };
}
