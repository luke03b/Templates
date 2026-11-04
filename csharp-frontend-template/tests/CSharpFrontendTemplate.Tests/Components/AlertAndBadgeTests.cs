// Test di Alert e Badge: tono, ruolo ARIA e chiusura.
using CSharpFrontendTemplate.Components.Ui;
using CSharpFrontendTemplate.Tests.TestUtilities;
using Microsoft.AspNetCore.Components;

namespace CSharpFrontendTemplate.Tests.Components;

public sealed class AlertAndBadgeTests : UiTestContext
{
    [Fact]
    public void DangerAlert_UsesAlertRole()
    {
        var cut = Render<Alert>(p => p.Add(a => a.Tone, Tone.Danger).Add(a => a.Title, "Error").AddChildContent("Boom"));

        var alert = cut.Find(".alert");
        Assert.Equal("alert", alert.GetAttribute("role"));
        Assert.Contains("tone-danger", alert.ClassName);
        Assert.Contains("Boom", alert.TextContent);
        Assert.Empty(cut.FindAll(".alert-close"));
    }

    [Fact]
    public void DismissibleAlert_InvokesOnDismiss()
    {
        var dismissed = false;
        var cut = Render<Alert>(p => p.Add(a => a.OnDismiss, EventCallback.Factory.Create(this, () => dismissed = true)));

        cut.Find(".alert-close").Click();

        Assert.True(dismissed);
    }

    [Fact]
    public void Badge_RendersTone()
    {
        var cut = Render<Badge>(p => p.Add(b => b.Tone, Tone.Success).AddChildContent("Active"));

        cut.MarkupMatches("""<span class="badge tone-success">Active</span>""");
    }
}
