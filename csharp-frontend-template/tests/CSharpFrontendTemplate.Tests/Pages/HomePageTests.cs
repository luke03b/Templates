// Test della pagina Home: indicatore Online/Offline in base a GET /api/health.
using System.Net;
using CSharpFrontendTemplate.Pages;
using CSharpFrontendTemplate.Services;
using CSharpFrontendTemplate.Tests.TestUtilities;

namespace CSharpFrontendTemplate.Tests.Pages;

public sealed class HomePageTests : UiTestContext
{
    [Fact]
    public void HealthyBackend_ShowsOnline()
    {
        var cut = Render<Home>();

        cut.WaitForAssertion(() =>
        {
            Assert.Contains("status-online", cut.Find(".status").ClassName);
            Assert.Contains("Online", cut.Find(".status").TextContent);
            Assert.Contains("fake-backend", cut.Markup);
        });
    }

    [Fact]
    public void UnreachableBackend_ShowsOffline()
    {
        Api.NextError = new ApiException(null, "Unable to reach the server.");

        var cut = Render<Home>();

        cut.WaitForAssertion(() => Assert.Contains("Offline", cut.Find(".status").TextContent));
    }

    [Fact]
    public void Retry_ChecksAgain()
    {
        Api.NextError = new ApiException(HttpStatusCode.BadGateway, "Bad gateway");
        var cut = Render<Home>();
        cut.WaitForAssertion(() => Assert.Contains("Offline", cut.Find(".status").TextContent));

        Api.NextError = null;
        cut.Find(".hero-status button").Click();

        cut.WaitForAssertion(() => Assert.Contains("Online", cut.Find(".status").TextContent));
    }
}
