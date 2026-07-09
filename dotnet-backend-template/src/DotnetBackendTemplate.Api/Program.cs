using DotnetBackendTemplate.Application;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<IHealthService, HealthService>();

var app = builder.Build();

app.UseHttpsRedirection();
app.MapControllers();

app.Run();

public partial class Program;
