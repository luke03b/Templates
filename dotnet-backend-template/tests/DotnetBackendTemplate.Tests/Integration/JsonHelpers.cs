// Utility condivise dai test HTTP per leggere i corpi JSON.
using System.Net.Http.Json;
using System.Text.Json;

namespace DotnetBackendTemplate.Tests.Integration;

internal static class JsonHelpers
{
    public static async Task<JsonElement> ReadJsonAsync(this HttpResponseMessage response)
    {
        ArgumentNullException.ThrowIfNull(response);
        return await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
    }

    /// <summary>Messaggi di errore di un campo nell'oggetto "errors" dei Problem Details.</summary>
    public static string[] ErrorsFor(this JsonElement problem, string field) =>
        [.. problem.GetProperty("errors").GetProperty(field).EnumerateArray().Select(e => e.GetString() ?? string.Empty)];
}
