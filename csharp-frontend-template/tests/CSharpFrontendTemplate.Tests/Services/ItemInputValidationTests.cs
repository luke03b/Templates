// Test delle regole DataAnnotations di ItemInput (le stesse del contratto API).
using System.ComponentModel.DataAnnotations;
using CSharpFrontendTemplate.Models;

namespace CSharpFrontendTemplate.Tests.Services;

public sealed class ItemInputValidationTests
{
    private static List<ValidationResult> Validate(ItemInput input)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(input, new ValidationContext(input), results, validateAllProperties: true);
        return results;
    }

    [Fact]
    public void ValidInput_HasNoErrors() =>
        Assert.Empty(Validate(new ItemInput { Name = "Keyboard", Price = 0 }));

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void BlankName_IsRequired(string name) =>
        Assert.Contains(Validate(new ItemInput { Name = name, Price = 1 }), r => r.ErrorMessage == "name is required");

    [Fact]
    public void TooLongName_IsRejected() =>
        Assert.Contains(Validate(new ItemInput { Name = new string('a', 101), Price = 1 }), r => r.MemberNames.Contains(nameof(ItemInput.Name)));

    [Fact]
    public void TooLongDescription_IsRejected() =>
        Assert.Contains(Validate(new ItemInput { Name = "a", Description = new string('a', 501), Price = 1 }), r => r.MemberNames.Contains(nameof(ItemInput.Description)));

    [Fact]
    public void NegativePrice_IsRejected() =>
        Assert.Contains(Validate(new ItemInput { Name = "a", Price = -1 }), r => r.ErrorMessage == "price must be greater than or equal to 0");

    [Fact]
    public void MissingPrice_IsRequired() =>
        Assert.Contains(Validate(new ItemInput { Name = "a" }), r => r.ErrorMessage == "price is required");
}
