using CSharpBackendTemplate.Contracts;

namespace CSharpBackendTemplate.Application;

public interface IHealthService
{
    HealthResponse GetHealth();
}

public sealed class HealthService : IHealthService
{
    public HealthResponse GetHealth()
    {
        return new HealthResponse("UP", "C# backend template is running");
    }
}
