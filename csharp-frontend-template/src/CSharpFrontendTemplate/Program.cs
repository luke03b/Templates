// Program.cs: punto di ingresso dell'app Blazor WebAssembly.
// Qui si fa solo il "bootstrap": componenti radice, configurazione e registrazione dei servizi
// nel contenitore di Dependency Injection (DI). Nessuna logica applicativa.
using CSharpFrontendTemplate;
using CSharpFrontendTemplate.Configuration;
using CSharpFrontendTemplate.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

// Componenti radice: App dentro <div id="app">, HeadOutlet per <PageTitle>/<HeadContent>.
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// La configurazione arriva da wwwroot/appsettings.json (+ appsettings.{Environment}.json).
var apiBaseAddress = ApiOptions.ResolveBaseAddress(
    builder.Configuration[ApiOptions.ApiBaseUrlKey],
    builder.HostEnvironment.BaseAddress);

// DI: AddScoped in WebAssembly equivale di fatto a un singleton per scheda del browser.
// HttpClient tipizzato: IApiClient riceve un HttpClient già configurato con BaseAddress.
builder.Services.AddScoped<IApiClient>(_ => new ApiClient(new HttpClient { BaseAddress = apiBaseAddress }));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<ToastService>();

await builder.Build().RunAsync();
