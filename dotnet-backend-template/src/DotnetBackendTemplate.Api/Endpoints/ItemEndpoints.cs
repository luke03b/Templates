// Endpoint CRUD di /api/items. Gli handler sono sottili: ricevono l'input (gia validato),
// chiamano IItemService e traducono il risultato in una risposta HTTP.
using DotnetBackendTemplate.Application.Items;
using DotnetBackendTemplate.Contracts.Items;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DotnetBackendTemplate.Api.Endpoints;

public static class ItemEndpoints
{
    private const string GetItemRouteName = "GetItem";

    public static RouteGroupBuilder MapItemEndpoints(this IEndpointRouteBuilder routes)
    {
        // MapGroup = prefisso comune + metadati condivisi (tag OpenAPI, autorizzazione, filtri, ...).
        var group = routes.MapGroup("/items").WithTags("Items");

        group.MapGet("", ListItems)
            .WithName("ListItems")
            .WithSummary("List all items ordered by createdAt");

        // {id:guid} e un vincolo di rotta: un id non-UUID non trova la rotta e risponde 404.
        group.MapGet("/{id:guid}", GetItem)
            .WithName(GetItemRouteName)
            .WithSummary("Get an item by id");

        group.MapPost("", CreateItem)
            .WithName("CreateItem")
            .WithSummary("Create an item")
            .ProducesValidationProblem();

        group.MapPut("/{id:guid}", UpdateItem)
            .WithName("UpdateItem")
            .WithSummary("Update an item")
            .ProducesValidationProblem();

        group.MapDelete("/{id:guid}", DeleteItem)
            .WithName("DeleteItem")
            .WithSummary("Delete an item");

        return group;
    }

    // CancellationToken viene collegato alla richiesta: se il client chiude la connessione
    // l'operazione puo essere interrotta.
    private static async Task<Ok<IReadOnlyList<ItemResponse>>> ListItems(
        IItemService service,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await service.ListAsync(cancellationToken).ConfigureAwait(false));

    // Results<A, B> dichiara i possibili esiti: il compilatore li verifica e OpenAPI li documenta.
    private static async Task<Results<Ok<ItemResponse>, ProblemHttpResult>> GetItem(
        Guid id,
        IItemService service,
        CancellationToken cancellationToken)
    {
        var item = await service.GetAsync(id, cancellationToken).ConfigureAwait(false);
        return item is null ? ItemNotFound(id) : TypedResults.Ok(item);
    }

    // ItemRequest arriva dal body JSON. La validazione built-in (AddValidation) controlla gli
    // attributi DataAnnotations PRIMA di eseguire l'handler: qui l'input e gia valido.
    // LinkGenerator costruisce l'URL a partire dal nome della rotta (niente stringhe duplicate).
    private static async Task<Created<ItemResponse>> CreateItem(
        ItemRequest request,
        IItemService service,
        LinkGenerator links,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        var item = await service.CreateAsync(request, cancellationToken).ConfigureAwait(false);
        // 201 Created con header Location relativo (/api/items/{id}): funziona anche dietro proxy.
        var location = links.GetPathByName(httpContext, GetItemRouteName, new { id = item.Id });
        return TypedResults.Created(location, item);
    }

    private static async Task<Results<Ok<ItemResponse>, ProblemHttpResult>> UpdateItem(
        Guid id,
        ItemRequest request,
        IItemService service,
        CancellationToken cancellationToken)
    {
        var item = await service.UpdateAsync(id, request, cancellationToken).ConfigureAwait(false);
        return item is null ? ItemNotFound(id) : TypedResults.Ok(item);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> DeleteItem(
        Guid id,
        IItemService service,
        CancellationToken cancellationToken)
    {
        var deleted = await service.DeleteAsync(id, cancellationToken).ConfigureAwait(false);
        return deleted ? TypedResults.NoContent() : ItemNotFound(id);
    }

    private static ProblemHttpResult ItemNotFound(Guid id) =>
        TypedResults.Problem(
            statusCode: StatusCodes.Status404NotFound,
            title: "Not Found",
            detail: $"Item '{id}' was not found.");
}
