// Sonda di salute usata dall'HEALTHCHECK del Dockerfile.
// L'immagine aspnet non contiene curl/wget: invece di installarli, la stessa app avviata con
// "--healthcheck" fa una GET su /api/health e termina con exit code 0 (sano) o 1 (non sano).
using DotnetBackendTemplate.Api.Configuration;

namespace DotnetBackendTemplate.Api;

public static class HealthProbe
{
    public const string Argument = "--healthcheck";

    public static async Task<int> RunAsync()
    {
        // Nel container PORT=8080 e impostata dal Dockerfile.
        var port = int.TryParse(Environment.GetEnvironmentVariable(ApiSettings.PortKey), out var value)
            ? value
            : ApiSettings.DefaultPort;

        // UseProxy = false: la richiesta e locale e non deve passare da eventuali proxy HTTP.
        using var handler = new HttpClientHandler { UseProxy = false };
        using var client = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(3) };
        try
        {
            using var response = await client
                .GetAsync(new Uri($"http://127.0.0.1:{port}/api/health"))
                .ConfigureAwait(false);
            return response.IsSuccessStatusCode ? 0 : 1;
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException)
        {
            await Console.Error.WriteLineAsync($"Health check failed: {exception.Message}").ConfigureAwait(false);
            return 1;
        }
    }
}
