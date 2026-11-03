// Test della regola che calcola l'URL base del backend da appsettings.json.
using CSharpFrontendTemplate.Configuration;

namespace CSharpFrontendTemplate.Tests.Services;

public sealed class ApiOptionsTests
{
    [Theory]
    [InlineData("", "http://localhost:8084/", "http://localhost:8084/")]
    [InlineData(null, "http://localhost:8084/", "http://localhost:8084/")]
    [InlineData("http://localhost:3000", "http://localhost:5200/", "http://localhost:3000/")]
    [InlineData(" http://api.example.com/base/ ", "http://localhost:5200/", "http://api.example.com/base/")]
    public void ResolveBaseAddress_UsesConfigOrSameOrigin(string? configured, string host, string expected)
    {
        Assert.Equal(new Uri(expected), ApiOptions.ResolveBaseAddress(configured, host));
    }

    [Fact]
    public void ResolveBaseAddress_RelativeApiPathKeepsBasePath()
    {
        var baseAddress = ApiOptions.ResolveBaseAddress("http://api.example.com/base", "http://localhost/");

        Assert.Equal("http://api.example.com/base/api/items", new Uri(baseAddress, "api/items").ToString());
    }
}
