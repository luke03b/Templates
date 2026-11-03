// Fabbrica dell'app per i test di integrazione: avvia l'API vera in memoria (TestServer)
// e permette di sostituire alcune dipendenze (qui l'orologio) con versioni controllabili.
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Time.Testing;

namespace DotnetBackendTemplate.Tests.Integration;

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string AllowedOrigin = "http://localhost:5173";

    /// <summary>Orologio finto: i test possono farlo avanzare con Time.Advance(...).</summary>
    public FakeTimeProvider Time { get; } = new(new DateTimeOffset(2026, 11, 3, 18, 0, 0, TimeSpan.Zero));

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        // Valori espliciti: i test non dipendono da un eventuale file .env locale.
        builder.UseSetting("CORS_ORIGINS", AllowedOrigin);
        builder.UseSetting("LOG_LEVEL", "warn");
        builder.UseSetting("Logging:LogLevel:Microsoft.Hosting.Lifetime", "Warning");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(Time);
        });
    }
}
