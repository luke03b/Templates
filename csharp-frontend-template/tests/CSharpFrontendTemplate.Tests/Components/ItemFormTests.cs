// Test di ItemForm: validazione lato client (DataAnnotations) ed errori del server
// (Problem Details) mostrati sotto ai campi tramite ServerValidator.
using CSharpFrontendTemplate.Components.Items;
using CSharpFrontendTemplate.Models;
using CSharpFrontendTemplate.Tests.TestUtilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;

namespace CSharpFrontendTemplate.Tests.Components;

public sealed class ItemFormTests : UiTestContext
{
    [Fact]
    public void InvalidSubmit_ShowsClientErrors_AndDoesNotCallback()
    {
        var submitted = false;
        var cut = Render<ItemForm>(p => p
            .Add(f => f.Model, new ItemInput())
            .Add(f => f.OnValidSubmit, EventCallback.Factory.Create<EditContext>(this, () => submitted = true)));

        cut.Find("form").Submit();

        Assert.False(submitted);
        var messages = cut.FindAll(".validation-message").Select(m => m.TextContent).ToList();
        Assert.Contains("name is required", messages);
        Assert.Contains("price is required", messages);
    }

    [Fact]
    public void ValidSubmit_InvokesCallback()
    {
        var model = new ItemInput();
        var submitted = false;
        var cut = Render<ItemForm>(p => p
            .Add(f => f.Model, model)
            .Add(f => f.OnValidSubmit, EventCallback.Factory.Create<EditContext>(this, () => submitted = true)));

        cut.Find("#item-name").Change("Keyboard");
        cut.Find("#item-price").Change("12.5");
        cut.Find("form").Submit();

        Assert.True(submitted);
        Assert.Equal("Keyboard", model.Name);
        Assert.Equal(12.5m, model.Price);
    }

    [Fact]
    public void ShowServerErrors_MapsCamelCaseKeysToFields()
    {
        var cut = Render<ItemForm>(p => p.Add(f => f.Model, new ItemInput { Name = "Keyboard", Price = 1 }));

        cut.InvokeAsync(() => cut.Instance.ShowServerErrors(new Dictionary<string, string[]>
        {
            ["name"] = ["name already exists"],
        }));

        Assert.Equal("name already exists", cut.Find(".validation-message").TextContent);
        Assert.Contains("invalid", cut.Find("#item-name").ClassName);
    }
}
