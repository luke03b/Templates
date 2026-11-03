// ServerValidator: mostra nella form gli errori di validazione restituiti dal BACKEND
// (Problem Details 400, "errors": { "name": ["..."] }) accanto ai campi giusti.
// È il pattern "CustomValidation" della documentazione Microsoft: un componente senza markup
// che riceve l'EditContext dalla EditForm (CascadingParameter) e scrive in un ValidationMessageStore.
// Uso: <EditForm ...><DataAnnotationsValidator /><ServerValidator @ref="_serverValidator" />...</EditForm>
//      poi, nel catch: _serverValidator.DisplayErrors(ex.ValidationErrors);
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;

namespace CSharpFrontendTemplate.Components.Ui;

public sealed class ServerValidator : ComponentBase, IDisposable
{
    private ValidationMessageStore? _messageStore;
    private EditContext? _subscribedContext;

    [CascadingParameter] private EditContext? CurrentEditContext { get; set; }

    protected override void OnParametersSet()
    {
        if (CurrentEditContext is null)
        {
            throw new InvalidOperationException($"{nameof(ServerValidator)} must be placed inside an EditForm.");
        }

        if (ReferenceEquals(CurrentEditContext, _subscribedContext))
        {
            return;
        }

        Unsubscribe();
        _subscribedContext = CurrentEditContext;
        _messageStore = new ValidationMessageStore(CurrentEditContext);
        // Un nuovo submit o una modifica del campo cancellano gli errori del server ormai vecchi.
        CurrentEditContext.OnValidationRequested += OnValidationRequested;
        CurrentEditContext.OnFieldChanged += OnFieldChanged;
    }

    /// <summary>Associa ogni chiave camelCase del backend ("name") alla proprietà del modello ("Name").</summary>
    public void DisplayErrors(IReadOnlyDictionary<string, string[]> errors)
    {
        if (_subscribedContext is null || _messageStore is null)
        {
            return;
        }

        _messageStore.Clear();
        foreach (var (key, messages) in errors)
        {
            // Chiave vuota o sconosciuta = errore generale del modello (visibile in <ValidationSummary />).
            var field = string.IsNullOrWhiteSpace(key)
                ? new FieldIdentifier(_subscribedContext.Model, string.Empty)
                : _subscribedContext.Field(ToPropertyName(key));
            _messageStore.Add(field, messages);
        }

        _subscribedContext.NotifyValidationStateChanged();
    }

    public void ClearErrors()
    {
        _messageStore?.Clear();
        _subscribedContext?.NotifyValidationStateChanged();
    }

    // "price" -> "Price". Niente reflection: resta sicuro con il trimming del publish WebAssembly.
    internal static string ToPropertyName(string key) =>
        key.Length == 0 ? key : char.ToUpperInvariant(key[0]) + key[1..];

    private void OnValidationRequested(object? sender, ValidationRequestedEventArgs e) => _messageStore?.Clear();

    private void OnFieldChanged(object? sender, FieldChangedEventArgs e) => _messageStore?.Clear(e.FieldIdentifier);

    private void Unsubscribe()
    {
        if (_subscribedContext is null)
        {
            return;
        }

        _subscribedContext.OnValidationRequested -= OnValidationRequested;
        _subscribedContext.OnFieldChanged -= OnFieldChanged;
    }

    public void Dispose() => Unsubscribe();
}
