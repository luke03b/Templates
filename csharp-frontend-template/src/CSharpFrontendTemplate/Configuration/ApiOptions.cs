// ApiOptions: calcola l'URL base del backend a partire dalla configurazione.
// Separato da Program.cs così la regola è testabile con un unit test.
namespace CSharpFrontendTemplate.Configuration;

public static class ApiOptions
{
    /// <summary>Chiave in appsettings.json (es. "ApiBaseUrl": "http://localhost:3000").</summary>
    public const string ApiBaseUrlKey = "ApiBaseUrl";

    /// <summary>
    /// Restituisce l'URL base per le chiamate API.
    /// Vuoto/assente = stessa origine della pagina (in Docker nginx fa da proxy di /api/).
    /// Garantisce lo "/" finale, altrimenti new Uri(base, "api/items") perderebbe l'ultimo segmento.
    /// </summary>
    public static Uri ResolveBaseAddress(string? configuredUrl, string hostBaseAddress)
    {
        var url = string.IsNullOrWhiteSpace(configuredUrl) ? hostBaseAddress : configuredUrl.Trim();
        return new Uri(url.EndsWith('/') ? url : url + "/", UriKind.Absolute);
    }
}
