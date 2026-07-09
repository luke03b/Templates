using DotnetBackendTemplate.Contracts;

namespace DotnetBackendTemplate.Application;

public interface IHealthService
{
    HealthResponse GetHealth();
}

public sealed class HealthService : IHealthService
{
    public HealthResponse GetHealth()
    {
        return new HealthResponse("UP", "NET backend template is running");
    }
}
