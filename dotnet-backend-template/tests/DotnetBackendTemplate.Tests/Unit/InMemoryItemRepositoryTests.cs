// Unit test del repository in memoria (accesso ai dati, nessuna regola di business).
using DotnetBackendTemplate.Application.Items;
using DotnetBackendTemplate.Infrastructure.Items;
using Microsoft.Extensions.Time.Testing;

namespace DotnetBackendTemplate.Tests.Unit;

public sealed class InMemoryItemRepositoryTests
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task SeedData_ContainsThreeItemsOrderedByCreatedAt()
    {
        var repository = new InMemoryItemRepository(ItemSeedData.Create(new FakeTimeProvider()));

        var items = await repository.ListAsync(Ct);

        Assert.Equal(3, items.Count);
        Assert.Equal(items.OrderBy(i => i.CreatedAt), items);
    }

    [Fact]
    public async Task UpdateAsync_MissingItem_ReturnsFalseAndDoesNotInsert()
    {
        var repository = new InMemoryItemRepository();
        var item = new Item(Guid.NewGuid(), "Ghost", null, 1m, DateTime.UtcNow, DateTime.UtcNow);

        Assert.False(await repository.UpdateAsync(item, Ct));
        Assert.Empty(await repository.ListAsync(Ct));
    }

    [Fact]
    public async Task AddAsync_DuplicateId_Throws()
    {
        var repository = new InMemoryItemRepository();
        var item = new Item(Guid.NewGuid(), "One", null, 1m, DateTime.UtcNow, DateTime.UtcNow);
        await repository.AddAsync(item, Ct);

        await Assert.ThrowsAsync<InvalidOperationException>(() => repository.AddAsync(item, Ct));
    }
}
