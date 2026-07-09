using DotnetBackendTemplate.Application;
using DotnetBackendTemplate.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace DotnetBackendTemplate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class HealthController : ControllerBase
{
    private readonly IHealthService _healthService;

    public HealthController(IHealthService healthService)
    {
        _healthService = healthService;
    }

    [HttpGet]
    public ActionResult<HealthResponse> Get()
    {
        return Ok(_healthService.GetHealth());
    }
}
