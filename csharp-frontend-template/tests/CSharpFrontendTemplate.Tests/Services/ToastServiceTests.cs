// Test del ToastService: aggiunta, rimozione manuale e rimozione automatica a tempo.
using CSharpFrontendTemplate.Services;
using Microsoft.Extensions.Time.Testing;

namespace CSharpFrontendTemplate.Tests.Services;

public sealed class ToastServiceTests
{
    [Fact]
    public void Show_AddsToastAndRaisesChanged()
    {
        var service = new ToastService(new FakeTimeProvider());
        var changes = 0;
        service.Changed += () => changes++;

        var toast = service.ShowSuccess("Saved");

        Assert.Equal(ToastLevel.Success, Assert.Single(service.Toasts).Level);
        Assert.Equal("Saved", toast.Message);
        Assert.Equal(1, changes);
    }

    [Fact]
    public void Toast_IsDismissedAfterDuration()
    {
        var time = new FakeTimeProvider();
        var service = new ToastService(time);
        service.Show("Hello");

        time.Advance(ToastService.DefaultDuration);

        Assert.Empty(service.Toasts);
    }

    [Fact]
    public void Dismiss_RemovesOnlyThatToast()
    {
        var service = new ToastService(new FakeTimeProvider());
        var first = service.Show("First");
        service.Show("Second");

        service.Dismiss(first.Id);

        Assert.Equal("Second", Assert.Single(service.Toasts).Message);
    }
}
