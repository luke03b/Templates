// DTO di input per POST/PUT /api/items ("ItemInput" nel contratto) con le regole di validazione.
using System.ComponentModel.DataAnnotations;
using DotnetBackendTemplate.Contracts.Validation;

namespace DotnetBackendTemplate.Contracts.Items;

/// <summary>Corpo della richiesta per creare o aggiornare un item.</summary>
/// <remarks>
/// Gli attributi [Required], [Range], ... (DataAnnotations) sono letti dalla validazione
/// built-in delle Minimal API di .NET 10 (AddValidation): se una regola fallisce l'endpoint
/// non viene eseguito e il client riceve un 400 Problem Details con l'oggetto "errors".
/// I tipi sono nullable (string?, decimal?) per distinguere "campo mancante" da "valore 0".
/// </remarks>
public sealed record ItemRequest
{
    /// <summary>Nome dell'item (1-100 caratteri dopo il trim).</summary>
    [Required(ErrorMessage = "name is required")]
    [TrimmedLength(1, 100, ErrorMessage = "name must be between 1 and 100 characters")]
    public string? Name { get; init; }

    /// <summary>Descrizione opzionale (massimo 500 caratteri).</summary>
    [StringLength(500, ErrorMessage = "description must be at most 500 characters")]
    public string? Description { get; init; }

    /// <summary>Prezzo, maggiore o uguale a 0.</summary>
    [Required(ErrorMessage = "price is required")]
    [Range(0d, double.MaxValue, ErrorMessage = "price must be greater than or equal to 0")]
    public decimal? Price { get; init; }
}
