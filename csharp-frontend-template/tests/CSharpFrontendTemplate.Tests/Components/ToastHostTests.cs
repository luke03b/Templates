// Test di ToastHost: mostra i toast del servizio, li chiude al click e dopo la durata.
using CSharpFrontendTemplate.Components.Ui;
using CSharpFrontendTemplate.Services;
using CSharpFrontendTemplate.Tests.TestUtilities;
using Microsoft.Extensions.DependencyInjection;

namespace CSharpFrontendTemplate.Tests.Components;

public sealed class ToastHostTests : UiTestContext
{
    [Fact]
    public void ShowsToastsFromService()
    {
        var cut = Render<ToastHost>();
        var toasts = Services.GetRequiredService<ToastService>();

        toasts.ShowError("Failed");

        cut.WaitForAssertion(() =>
        {
            var toast = cut.Find(".toast");
            Assert.Contains("tone-danger", toast.ClassName);
            Assert.Equal("alert", toast.GetAttribute("role"));
            Assert.Contains("Failed", toast.TextContent);
        });
    }

    [Fact]
    public void CloseButton_DismissesToast()
    {
        var cut = Render<ToastHost>();
        Services.GetRequiredService<ToastService>().ShowSuccess("Saved");
        cut.WaitForElement(".toast");

        cut.Find(".toast-close").Click();

        cut.WaitForAssertion(() => Assert.Empty(cut.FindAll(".toast")));
    }

    [Fact]
    public void Toast_DisappearsAfterDuration()
    {
        var cut = Render<ToastHost>();
        Services.GetRequiredService<ToastService>().Show("Hello");
        cut.WaitForElement(".toast");

        Time.Advance(ToastService.DefaultDuration);

        cut.WaitForAssertion(() => Assert.Empty(cut.FindAll(".toast")));
    }
}
