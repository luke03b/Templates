// FakeHttpMessageHandler: sostituisce la rete nei test dell'ApiClient.
// HttpClient delega l'invio a un HttpMessageHandler: passandone uno finto possiamo
// decidere la risposta e controllare la richiesta (metodo, URL, corpo) senza un server vero.
using System.Net;
using System.Text;

namespace CSharpFrontendTemplate.Tests.TestUtilities;

public sealed class FakeHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) : HttpMessageHandler
{
    public List<RecordedRequest> Requests { get; } = [];

    public static HttpClient CreateClient(Func<HttpRequestMessage, HttpResponseMessage> respond, out FakeHttpMessageHandler handler)
    {
        handler = new FakeHttpMessageHandler(respond);
        return new HttpClient(handler) { BaseAddress = new Uri("http://localhost:3000/") };
    }

    public static HttpResponseMessage Json(HttpStatusCode status, string json, string mediaType = "application/json") =>
        new(status) { Content = new StringContent(json, Encoding.UTF8, mediaType) };

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var body = request.Content is null ? null : await request.Content.ReadAsStringAsync(cancellationToken);
        Requests.Add(new RecordedRequest(request.Method, request.RequestUri!, body));
        return respond(request);
    }

    public sealed record RecordedRequest(HttpMethod Method, Uri Uri, string? Body);
}
