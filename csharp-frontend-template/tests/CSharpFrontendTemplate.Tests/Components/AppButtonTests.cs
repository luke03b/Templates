// Test di AppButton: classi CSS delle varianti, stato loading/disabled e click.
using CSharpFrontendTemplate.Components.Ui;
using CSharpFrontendTemplate.Tests.TestUtilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace CSharpFrontendTemplate.Tests.Components;

public sealed class AppButtonTests : UiTestContext
{
    [Fact]
    public void RendersVariantAndSizeClasses()
    {
        var cut = Render<AppButton>(p => p
            .Add(b => b.Variant, ButtonVariant.Danger)
            .Add(b => b.Size, ButtonSize.Small)
            .AddChildContent("Delete"));

        var button = cut.Find("button");
        Assert.Equal("btn btn-danger btn-sm", button.ClassName);
        Assert.Equal("button", button.GetAttribute("type"));
        Assert.Contains("Delete", button.TextContent);
    }

    [Fact]
    public void Loading_DisablesButtonAndShowsSpinner()
    {
        var cut = Render<AppButton>(p => p.Add(b => b.Loading, true).AddChildContent("Save"));

        var button = cut.Find("button");
        Assert.True(button.HasAttribute("disabled"));
        Assert.Equal("true", button.GetAttribute("aria-busy"));
        Assert.NotNull(cut.Find(".spinner"));
    }

    [Fact]
    public void Click_InvokesCallback()
    {
        var clicks = 0;
        var cut = Render<AppButton>(p => p
            .Add(b => b.OnClick, EventCallback.Factory.Create<MouseEventArgs>(this, () => clicks++))
            .AddChildContent("Click"));

        cut.Find("button").Click();

        Assert.Equal(1, clicks);
    }

    [Fact]
    public void PassesExtraAttributes()
    {
        var cut = Render<AppButton>(p => p.AddUnmatched("aria-label", "Close dialog"));

        Assert.Equal("Close dialog", cut.Find("button").GetAttribute("aria-label"));
    }
}
