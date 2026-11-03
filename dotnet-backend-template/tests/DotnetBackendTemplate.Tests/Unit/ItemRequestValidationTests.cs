// Unit test delle regole DataAnnotations di ItemRequest (senza avviare l'API).
using System.ComponentModel.DataAnnotations;
using DotnetBackendTemplate.Contracts.Items;

namespace DotnetBackendTemplate.Tests.Unit;

public sealed class ItemRequestValidationTests
{
    [Theory]
    [InlineData("a", true)]
    [InlineData("  padded name  ", true)]
    [InlineData("   ", false)]
    [InlineData(null, false)]
    public void Name_IsRequiredAndTrimmed(string? name, bool expectedValid)
    {
        Assert.Equal(expectedValid, IsValid(new ItemRequest { Name = name, Price = 1m }));
    }

    [Fact]
    public void Name_LongerThan100CharactersAfterTrim_IsInvalid()
    {
        Assert.True(IsValid(new ItemRequest { Name = $"  {new string('a', 100)}  ", Price = 1m }));
        Assert.False(IsValid(new ItemRequest { Name = new string('a', 101), Price = 1m }));
    }

    [Theory]
    [InlineData(0, true)]
    [InlineData(-0.01, false)]
    public void Price_MustBeNonNegative(double price, bool expectedValid)
    {
        Assert.Equal(expectedValid, IsValid(new ItemRequest { Name = "Valid", Price = (decimal)price }));
    }

    [Fact]
    public void Description_IsOptionalUpTo500Characters()
    {
        Assert.True(IsValid(new ItemRequest { Name = "Valid", Price = 1m, Description = null }));
        Assert.True(IsValid(new ItemRequest { Name = "Valid", Price = 1m, Description = new string('d', 500) }));
        Assert.False(IsValid(new ItemRequest { Name = "Valid", Price = 1m, Description = new string('d', 501) }));
    }

    private static bool IsValid(ItemRequest request) =>
        Validator.TryValidateObject(request, new ValidationContext(request), [], validateAllProperties: true);
}
