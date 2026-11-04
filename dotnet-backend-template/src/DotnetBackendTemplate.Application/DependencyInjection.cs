// Registrazione nel container DI dei servizi del layer Application.
using DotnetBackendTemplate.Application.Health;
using DotnetBackendTemplate.Application.Items;
using Microsoft.Extensions.DependencyInjection;

namespace DotnetBackendTemplate.Application;

public static class DependencyInjection
{
    /// <summary>
    /// Metodo di estensione (il "this" sul primo parametro) chiamato da Program.cs:
    /// builder.Services.AddApplication(). Ogni layer registra le proprie classi.
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Singleton: orologio di sistema condiviso. Scoped: un'istanza per richiesta HTTP.
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<IHealthService, HealthService>();
        services.AddScoped<IItemService, ItemService>();
        return services;
    }
}
