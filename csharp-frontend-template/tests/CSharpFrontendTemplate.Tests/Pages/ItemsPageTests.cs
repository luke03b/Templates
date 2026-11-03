// Test della pagina Items: lista, errore di caricamento, creazione con errori di
// validazione del server (Problem Details) ed eliminazione con conferma.
using System.Net;
using CSharpFrontendTemplate.Models;
using CSharpFrontendTemplate.Pages;
using CSharpFrontendTemplate.Services;
using CSharpFrontendTemplate.Tests.TestUtilities;
using Microsoft.Extensions.DependencyInjection;

namespace CSharpFrontendTemplate.Tests.Pages;

public sealed class ItemsPageTests : UiTestContext
{
    public ItemsPageTests()
    {
        Api.Items.Add(FakeApiClient.CreateItem("1", "Keyboard", 49.9m));
        Api.Items.Add(FakeApiClient.CreateItem("2", "Mouse", 19.9m));
    }

    // QuickGrid con paginazione aggiunge righe vuote fino a ItemsPerPage: contiamo solo quelle con dati.
    private static List<AngleSharp.Dom.IElement> DataRows(IRenderedComponent<Items> cut) =>
        [.. cut.FindAll("tbody tr").Where(r => !string.IsNullOrWhiteSpace(r.TextContent))];

    [Fact]
    public void ShowsItemsInTable()
    {
        var cut = Render<Items>();

        cut.WaitForAssertion(() => Assert.Equal(2, DataRows(cut).Count));
        Assert.Contains("Keyboard", cut.Markup);
        Assert.Contains("Mouse", cut.Markup);
    }

    [Fact]
    public void EmptyList_ShowsEmptyState()
    {
        Api.Items.Clear();

        var cut = Render<Items>();

        cut.WaitForAssertion(() => Assert.Contains("No items yet", cut.Markup));
    }

    [Fact]
    public void LoadError_ShowsAlert()
    {
        Api.NextError = new ApiException(null, "Unable to reach the server.");

        var cut = Render<Items>();

        cut.WaitForAssertion(() => Assert.Contains("Unable to reach the server.", cut.Find(".alert").TextContent));
    }

    [Fact]
    public void Create_AddsItemAndShowsToast()
    {
        var cut = Render<Items>();
        cut.WaitForAssertion(() => Assert.NotEmpty(DataRows(cut)));

        cut.FindAll("button").First(b => b.TextContent.Trim() == "New item").Click();
        cut.Find("#item-name").Change("Monitor");
        cut.Find("#item-price").Change("199");
        cut.Find("form").Submit();

        cut.WaitForAssertion(() => Assert.Equal(3, DataRows(cut).Count));
        Assert.Contains(Services.GetRequiredService<ToastService>().Toasts, t => t.Message.Contains("Monitor", StringComparison.Ordinal));
        Assert.Empty(cut.FindAll("[role=dialog]"));
    }

    [Fact]
    public void Create_ServerValidationErrors_AreShownOnFields()
    {
        var cut = Render<Items>();
        cut.WaitForAssertion(() => Assert.NotEmpty(DataRows(cut)));
        cut.FindAll("button").First(b => b.TextContent.Trim() == "New item").Click();
        cut.Find("#item-name").Change("Monitor");
        cut.Find("#item-price").Change("1");

        Api.NextError = new ApiException(
            HttpStatusCode.BadRequest,
            "One or more fields are invalid.",
            new ProblemDetailsResponse("about:blank", "Validation failed", 400, "One or more fields are invalid.",
                new Dictionary<string, string[]> { ["name"] = ["name already exists"] }));
        cut.Find("form").Submit();

        cut.WaitForAssertion(() => Assert.Equal("name already exists", cut.Find(".validation-message").TextContent));
        Assert.NotNull(cut.Find("[role=dialog]"));
    }

    [Fact]
    public void Delete_AfterConfirmation_RemovesItem()
    {
        var cut = Render<Items>();
        cut.WaitForAssertion(() => Assert.NotEmpty(DataRows(cut)));

        cut.Find("button[aria-label='Delete Keyboard']").Click();
        cut.Find("[role=dialog] .btn-danger").Click();

        cut.WaitForAssertion(() => Assert.Single(DataRows(cut)));
        Assert.Equal(["1"], Api.DeletedIds);
    }
}
