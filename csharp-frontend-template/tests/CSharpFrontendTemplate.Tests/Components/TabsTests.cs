// Test di Tabs/TabPanel: prima scheda attiva, cambio con click e con le frecce.
// Il markup di test è scritto come RenderFragment in C# tramite il builder di bUnit.
using CSharpFrontendTemplate.Components.Ui;
using CSharpFrontendTemplate.Tests.TestUtilities;

namespace CSharpFrontendTemplate.Tests.Components;

public sealed class TabsTests : UiTestContext
{
    private IRenderedComponent<Tabs> RenderTabs() => Render<Tabs>(p => p
        .AddChildContent<TabPanel>(t => t.Add(x => x.Title, "One").AddChildContent("First"))
        .AddChildContent<TabPanel>(t => t.Add(x => x.Title, "Two").AddChildContent("Second")));

    [Fact]
    public void FirstTab_IsActiveByDefault()
    {
        var cut = RenderTabs();

        Assert.Equal(2, cut.FindAll("[role=tab]").Count);
        Assert.Equal("First", cut.Find("[role=tabpanel]").TextContent.Trim());
        Assert.Equal("true", cut.FindAll("[role=tab]")[0].GetAttribute("aria-selected"));
    }

    [Fact]
    public void ClickingTab_ShowsItsPanel()
    {
        var cut = RenderTabs();

        cut.FindAll("[role=tab]")[1].Click();

        Assert.Equal("Second", cut.Find("[role=tabpanel]").TextContent.Trim());
    }

    [Fact]
    public void ArrowKeys_MoveBetweenTabs()
    {
        var cut = RenderTabs();

        cut.Find("[role=tablist]").KeyDown("ArrowLeft");

        Assert.Equal("Second", cut.Find("[role=tabpanel]").TextContent.Trim());
    }
}
