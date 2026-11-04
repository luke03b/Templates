// DemoFormModel: modello della form di esempio nella pagina showcase.
// Mostra le DataAnnotations più comuni: [Required], [StringLength], [EmailAddress], [Range].
using System.ComponentModel.DataAnnotations;

namespace CSharpFrontendTemplate.Components.Showcase;

public sealed class DemoFormModel
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 50 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Enter a valid email address")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Select a role")]
    public string? Role { get; set; }

    [Required(ErrorMessage = "Choose a plan")]
    public string? Plan { get; set; }

    [StringLength(200, ErrorMessage = "Message must be at most 200 characters")]
    public string? Message { get; set; }

    public bool Newsletter { get; set; }

    // Un checkbox "obbligatorio" si valida richiedendo che il valore sia true.
    [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms")]
    public bool AcceptTerms { get; set; }
}
