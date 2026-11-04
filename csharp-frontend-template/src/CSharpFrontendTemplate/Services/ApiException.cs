// ApiException: errore unico lanciato dal client API per qualsiasi risposta non 2xx
// o problema di rete. Le pagine catturano solo questa eccezione e mostrano messaggi leggibili.
using System.Net;
using CSharpFrontendTemplate.Models;

namespace CSharpFrontendTemplate.Services;

public sealed class ApiException : Exception
{
    public ApiException(HttpStatusCode? statusCode, string message, ProblemDetailsResponse? problem = null, Exception? innerException = null)
        : base(message, innerException)
    {
        StatusCode = statusCode;
        Problem = problem;
    }

    /// <summary>Codice HTTP; null se il server non è stato raggiunto (rete, CORS, backend spento).</summary>
    public HttpStatusCode? StatusCode { get; }

    /// <summary>Corpo Problem Details restituito dal backend, se presente.</summary>
    public ProblemDetailsResponse? Problem { get; }

    /// <summary>Errori di validazione per campo (400), vuoto negli altri casi.</summary>
    public IReadOnlyDictionary<string, string[]> ValidationErrors =>
        Problem?.Errors ?? new Dictionary<string, string[]>();

    public bool IsValidationError => StatusCode == HttpStatusCode.BadRequest && ValidationErrors.Count > 0;

    public bool IsNotFound => StatusCode == HttpStatusCode.NotFound;
}
