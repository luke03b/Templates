// Errore unico restituito dal layer di rete. Converte le risposte
// Problem Details (RFC 9457) del backend e gli errori di rete in un oggetto
// tipizzato che la UI sa mostrare (messaggio generale + errori per campo).
class ApiException implements Exception {
  const ApiException({
    required this.statusCode,
    required this.title,
    this.detail,
    this.fieldErrors = const {},
  });

  /// Errore di rete (backend spento, DNS, CORS, timeout): non c'è uno status HTTP.
  const ApiException.network([String? detail])
    : this(
        statusCode: 0,
        title: 'Network error',
        detail: detail ?? 'Unable to reach the server.',
      );

  /// Costruisce l'eccezione dal corpo JSON di una risposta di errore.
  /// Tollera corpi mancanti o non conformi (es. 502 HTML di nginx).
  factory ApiException.fromProblem(int statusCode, Object? body) {
    if (body is! Map<String, dynamic>) {
      return ApiException(
        statusCode: statusCode,
        title: _defaultTitle(statusCode),
      );
    }
    final errors = <String, List<String>>{};
    final rawErrors = body['errors'];
    if (rawErrors is Map<String, dynamic>) {
      rawErrors.forEach((field, messages) {
        if (messages is List) {
          errors[field] = messages.map((m) => m.toString()).toList();
        } else if (messages != null) {
          errors[field] = [messages.toString()];
        }
      });
    }
    return ApiException(
      statusCode: statusCode,
      title: body['title'] as String? ?? _defaultTitle(statusCode),
      detail: body['detail'] as String?,
      fieldErrors: errors,
    );
  }

  /// 0 per errori di rete, altrimenti lo status HTTP (400, 404, 500...).
  final int statusCode;
  final String title;
  final String? detail;

  /// Errori di validazione: nome campo -> messaggi (solo per i 400).
  final Map<String, List<String>> fieldErrors;

  bool get isNetworkError => statusCode == 0;
  bool get isNotFound => statusCode == 404;
  bool get isValidationError => statusCode == 400;

  /// Primo messaggio per un campo, comodo come `errorText` di un TextField.
  String? fieldError(String field) => fieldErrors[field]?.firstOrNull;

  /// Messaggio leggibile da mostrare all'utente.
  String get message => detail == null ? title : '$title: $detail';

  static String _defaultTitle(int statusCode) => switch (statusCode) {
    400 => 'Bad request',
    404 => 'Not found',
    >= 500 => 'Server error',
    _ => 'Request failed ($statusCode)',
  };

  @override
  String toString() => 'ApiException($statusCode, $message)';
}
