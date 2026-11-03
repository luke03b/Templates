// Lettura delle impostazioni runtime (PORT, CORS_ORIGINS, LOG_LEVEL).
// I valori arrivano da IConfiguration, che unisce in ordine di priorita crescente:
// appsettings.json -> appsettings.{Environment}.json -> variabili d'ambiente -> argomenti da riga di comando.
namespace DotnetBackendTemplate.Api.Configuration;

public static class ApiSettings
{
    public const string PortKey = "PORT";
    public const string CorsOriginsKey = "CORS_ORIGINS";
    public const string LogLevelKey = "LOG_LEVEL";

    public const int DefaultPort = 5080;

    public static int GetPort(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        return int.TryParse(configuration[PortKey], out var port) && port is > 0 and <= 65535
            ? port
            : DefaultPort;
    }

    /// <summary>Divide "a,b , c" in ["a", "b", "c"], ignorando le voci vuote.</summary>
    public static IReadOnlyList<string> GetCorsOrigins(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        return configuration[CorsOriginsKey]?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? [];
    }

    /// <summary>Converte debug/info/warn/error (contratto) nel LogLevel di .NET.</summary>
    public static LogLevel GetLogLevel(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        return configuration[LogLevelKey]?.Trim().ToUpperInvariant() switch
        {
            "TRACE" => LogLevel.Trace,
            "DEBUG" => LogLevel.Debug,
            "WARN" or "WARNING" => LogLevel.Warning,
            "ERROR" => LogLevel.Error,
            "CRITICAL" or "FATAL" => LogLevel.Critical,
            _ => LogLevel.Information,
        };
    }
}
