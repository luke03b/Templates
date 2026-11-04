// Test del menu responsive e della pagina 404.
using CSharpFrontendTemplate.Layout;
using CSharpFrontendTemplate.Pages;
using CSharpFrontendTemplate.Tests.TestUtilities;

namespace CSharpFrontendTemplate.Tests.Pages;

public sealed class LayoutAndNotFoundTests : UiTestContext
{
    [Fact]
    public void NavMenu_ToggleOpensMobileMenu()
    {
        var cut = Render<NavMenu>();
        var toggle = cut.Find(".navbar-toggle");
        Assert.Equal("false", toggle.GetAttribute("aria-expanded"));

        toggle.Click();

        Assert.Equal("true", cut.Find(".navbar-toggle").GetAttribute("aria-expanded"));
        Assert.Contains("is-open", cut.Find("#main-nav").ClassName);
        Assert.Equal(3, cut.FindAll(".navbar-link").Count);
    }

    [Fact]
    public void NotFound_ShowsMessageAndHomeLink()
    {
        var cut = Render<NotFound>();

        Assert.Equal("Page not found", cut.Find("h1").TextContent);
        Assert.NotNull(cut.Find("a[href='']"));
    }

    [Fact]
    public void ComponentsPage_Renders()
    {
        var cut = Render<CSharpFrontendTemplate.Pages.Components>();

        Assert.Equal("Components", cut.Find("h1").TextContent);
        Assert.True(cut.FindAll(".example").Count >= 10);
    }
}
