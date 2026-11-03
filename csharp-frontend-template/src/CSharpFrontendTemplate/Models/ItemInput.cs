// ItemInput: DTO di INPUT per POST/PUT /api/items, usato anche come modello della form.
// Gli attributi DataAnnotations ([Required], [StringLength]...) replicano le regole del contratto:
// EditForm + DataAnnotationsValidator li controllano nel browser prima di chiamare il backend.
// È una classe mutabile (non un record) perché i campi della form la modificano con @bind-Value.
using System.ComponentModel.DataAnnotations;

namespace CSharpFrontendTemplate.Models;

public sealed class ItemInput
{
    public const int NameMaxLength = 100;
    public const int DescriptionMaxLength = 500;

    // [Required] su una stringa rifiuta anche "   " (solo spazi), come il trim del backend.
    [Required(ErrorMessage = "name is required")]
    [StringLength(NameMaxLength, ErrorMessage = "name must be at most 100 characters")]
    public string Name { get; set; } = string.Empty;

    [StringLength(DescriptionMaxLength, ErrorMessage = "description must be at most 500 characters")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "price is required")]
    [Range(0, double.MaxValue, ErrorMessage = "price must be greater than or equal to 0")]
    public decimal? Price { get; set; }

    /// <summary>Crea il modello della form a partire da un item esistente (modifica).</summary>
    public static ItemInput FromItem(Item item) => new()
    {
        Name = item.Name,
        Description = item.Description,
        Price = item.Price,
    };

    /// <summary>Normalizza i valori prima dell'invio (trim, stringa vuota = null).</summary>
    public ItemInput Normalized() => new()
    {
        Name = Name.Trim(),
        Description = string.IsNullOrWhiteSpace(Description) ? null : Description.Trim(),
        Price = Price,
    };
}
