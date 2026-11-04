// Registrazione nel container DI delle implementazioni del layer Infrastructure.
using DotnetBackendTemplate.Application.Items;
using DotnetBackendTemplate.Infrastructure.Items;
using Microsoft.Extensions.DependencyInjection;

namespace DotnetBackendTemplate.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Singleton: i dati in memoria devono sopravvivere tra una richiesta e l'altra.
        // Con un database vero si registrerebbe qui (Scoped) il repository basato su EF Core.
        services.AddSingleton<IItemRepository>(serviceProvider =>
            new InMemoryItemRepository(ItemSeedData.Create(serviceProvider.GetRequiredService<TimeProvider>())));
        return services;
    }
}
