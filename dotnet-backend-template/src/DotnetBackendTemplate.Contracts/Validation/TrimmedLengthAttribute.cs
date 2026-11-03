// Attributo di validazione personalizzato: controlla la lunghezza di una stringa DOPO il trim.
// Esempio di come creare una regola riusabile quando gli attributi standard non bastano.
using System.ComponentModel.DataAnnotations;

namespace DotnetBackendTemplate.Contracts.Validation;

/// <summary>
/// Valida che la stringa, senza spazi iniziali/finali, abbia lunghezza tra min e max.
/// Un valore null e considerato valido: per renderlo obbligatorio aggiungi [Required].
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class TrimmedLengthAttribute(int minimumLength, int maximumLength) : ValidationAttribute
{
    public int MinimumLength { get; } = minimumLength;

    public int MaximumLength { get; } = maximumLength;

    public override bool IsValid(object? value)
    {
        if (value is not string text)
        {
            return value is null;
        }

        var length = text.Trim().Length;
        return length >= MinimumLength && length <= MaximumLength;
    }
}
