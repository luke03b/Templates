// Unit test di ItemService: logica di business isolata da HTTP, con orologio finto e
// repository in memoria vuoto (un "fake" reale, piu affidabile di un mock).
using DotnetBackendTemplate.Application.Items;
using DotnetBackendTemplate.Contracts.Items;
using DotnetBackendTemplate.Infrastructure.Items;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Time.Testing;

namespace DotnetBackendTemplate.Tests.Unit;

public sealed class ItemServiceTests
{
    private readonly FakeTimeProvider _time = new(new DateTimeOffset(2026, 1, 1, 12, 0, 0, TimeSpan.Zero));
    private readonly InMemoryItemRepository _repository = new();
    private readonly ItemService _service;

    public ItemServiceTests()
    {
        _service = new ItemService(_repository, _time, NullLogger<ItemService>.Instance);
    }

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task CreateAsync_TrimsNameAndSetsTimestamps()
    {
        var created = await _service.CreateAsync(new ItemRequest { Name = "  Chair ", Description = "  Wooden  ", Price = 10m }, Ct);

        Assert.Equal("Chair", created.Name);
        Assert.Equal("Wooden", created.Description);
        Assert.Equal(10m, created.Price);
        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.Equal(_time.GetUtcNow().UtcDateTime, created.CreatedAt);
        Assert.Equal(created.CreatedAt, created.UpdatedAt);
        Assert.Equal(DateTimeKind.Utc, created.CreatedAt.Kind);
        Assert.NotNull(await _repository.GetByIdAsync(created.Id, Ct));
    }

    [Fact]
    public async Task CreateAsync_WhitespaceDescription_IsStoredAsNull()
    {
        var created = await _service.CreateAsync(new ItemRequest { Name = "Chair", Description = "   ", Price = 1m }, Ct);

        Assert.Null(created.Description);
    }

    [Fact]
    public async Task ListAsync_ReturnsItemsOrderedByCreatedAt()
    {
        var first = await _service.CreateAsync(new ItemRequest { Name = "First", Price = 1m }, Ct);
        _time.Advance(TimeSpan.FromSeconds(1));
        var second = await _service.CreateAsync(new ItemRequest { Name = "Second", Price = 2m }, Ct);

        var items = await _service.ListAsync(Ct);

        Assert.Equal([first.Id, second.Id], items.Select(i => i.Id));
    }

    [Fact]
    public async Task GetAsync_UnknownId_ReturnsNull()
    {
        Assert.Null(await _service.GetAsync(Guid.NewGuid(), Ct));
    }

    [Fact]
    public async Task UpdateAsync_KeepsCreatedAtAndRefreshesUpdatedAt()
    {
        var created = await _service.CreateAsync(new ItemRequest { Name = "Old", Price = 1m }, Ct);
        _time.Advance(TimeSpan.FromMinutes(10));

        var updated = await _service.UpdateAsync(created.Id, new ItemRequest { Name = " New ", Price = 2m }, Ct);

        Assert.NotNull(updated);
        Assert.Equal("New", updated.Name);
        Assert.Equal(2m, updated.Price);
        Assert.Equal(created.CreatedAt, updated.CreatedAt);
        Assert.Equal(created.CreatedAt.AddMinutes(10), updated.UpdatedAt);
    }

    [Fact]
    public async Task UpdateAsync_UnknownId_ReturnsNull()
    {
        var result = await _service.UpdateAsync(Guid.NewGuid(), new ItemRequest { Name = "X", Price = 1m }, Ct);

        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_RemovesItemOnlyOnce()
    {
        var created = await _service.CreateAsync(new ItemRequest { Name = "Temp", Price = 1m }, Ct);

        Assert.True(await _service.DeleteAsync(created.Id, Ct));
        Assert.False(await _service.DeleteAsync(created.Id, Ct));
        Assert.Null(await _service.GetAsync(created.Id, Ct));
    }
}
