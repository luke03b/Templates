// UiEnums: varianti visive condivise dai componenti UI. Ogni valore corrisponde a una
// classe CSS (es. Tone.Danger -> "tone-danger") definita in wwwroot/css/app.css.
namespace CSharpFrontendTemplate.Components.Ui;

public enum ButtonVariant
{
    Primary,
    Secondary,
    Danger,
    Ghost,
}

public enum ButtonSize
{
    Small,
    Medium,
    Large,
}

/// <summary>"Tono" semantico per Alert, Badge e Toast.</summary>
public enum Tone
{
    Neutral,
    Info,
    Success,
    Warning,
    Danger,
}

public static class UiCss
{
    public static string ToneClass(Tone tone) => $"tone-{tone.ToString().ToLowerInvariant()}";

    /// <summary>Unisce classi CSS ignorando quelle vuote: Join("btn", null, "x") = "btn x".</summary>
    public static string Join(params string?[] classes) =>
        string.Join(' ', classes.Where(c => !string.IsNullOrWhiteSpace(c)));
}
