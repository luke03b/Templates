// UiTestContext: base comune dei test bUnit. BunitContext è il "browser finto" di bUnit:
// renderizza i componenti in memoria e offre un contenitore DI (Services) da riempire.
using CSharpFrontendTemplate.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Time.Testing;

namespace CSharpFrontendTemplate.Tests.TestUtilities;

public abstract class UiTestContext : BunitContext
{
    protected UiTestContext()
    {
        // Loose: le chiamate JS non configurate (focus, clipboard, moduli QuickGrid) non fanno fallire i test.
        JSInterop.Mode = JSRuntimeMode.Loose;
        Services.AddSingleton<TimeProvider>(Time);
        Services.AddSingleton(Api);
        Services.AddSingleton<IApiClient>(Api);
        Services.AddSingleton<ToastService>();
    }

    /// <summary>Orologio controllabile: Time.Advance(...) fa scorrere il tempo nei test.</summary>
    protected FakeTimeProvider Time { get; } = new();

    protected FakeApiClient Api { get; } = new();
}
