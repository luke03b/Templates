// Test di Modal: visibilità, chiusura con bottone/Esc/sfondo e binding a due vie.
using CSharpFrontendTemplate.Components.Ui;
using CSharpFrontendTemplate.Tests.TestUtilities;

namespace CSharpFrontendTemplate.Tests.Components;

public sealed class ModalTests : UiTestContext
{
    private bool _isOpen = true;

    private IRenderedComponent<Modal> RenderModal(bool closeOnBackdrop = true) => Render<Modal>(p => p
        .Add(m => m.IsOpen, _isOpen)
        .Add(m => m.IsOpenChanged, open => _isOpen = open)
        .Add(m => m.Title, "Confirm")
        .Add(m => m.CloseOnBackdrop, closeOnBackdrop)
        .AddChildContent("<p>Body</p>"));

    [Fact]
    public void Closed_RendersNothing()
    {
        _isOpen = false;

        var cut = RenderModal();

        Assert.Empty(cut.Markup.Trim());
    }

    [Fact]
    public void Open_RendersAccessibleDialog()
    {
        var cut = RenderModal();

        var dialog = cut.Find("[role=dialog]");
        Assert.Equal("true", dialog.GetAttribute("aria-modal"));
        Assert.Equal("Confirm", cut.Find($"#{dialog.GetAttribute("aria-labelledby")}").TextContent);
    }

    [Fact]
    public void CloseButton_RequestsClose()
    {
        RenderModal().Find(".modal-close").Click();

        Assert.False(_isOpen);
    }

    [Fact]
    public void EscapeKey_RequestsClose()
    {
        RenderModal().Find("[role=dialog]").KeyDown("Escape");

        Assert.False(_isOpen);
    }

    [Fact]
    public void BackdropClick_IsIgnoredWhenDisabled()
    {
        RenderModal(closeOnBackdrop: false).Find(".modal-backdrop").Click();

        Assert.True(_isOpen);
    }
}
