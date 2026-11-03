// Client HTTP unico dell'app, costruito su package:http (ufficiale Dart).
// Si occupa di: URL base, header JSON, timeout, codifica/decodifica JSON e
// conversione di ogni errore in ApiException. I repository lo usano; le
// pagine e i widget non lo vedono mai direttamente.
import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/config/app_config.dart';
import 'api_exception.dart';

class ApiClient {
  /// [baseUrl] vuoto = URL relativi (stessa origine della pagina web).
  /// [httpClient] è iniettabile: nei test si passa un MockClient.
  ApiClient({
    String baseUrl = AppConfig.apiBaseUrl,
    http.Client? httpClient,
    this.timeout = AppConfig.requestTimeout,
  }) : baseUrl = _trimTrailingSlash(baseUrl),
       _http = httpClient ?? http.Client();

  final String baseUrl;
  final Duration timeout;
  final http.Client _http;

  static const _jsonHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  /// GET che restituisce il JSON decodificato (Map, List, ...).
  Future<Object?> get(String path) => _send('GET', path);

  Future<Object?> post(String path, Object body) =>
      _send('POST', path, body: body);

  Future<Object?> put(String path, Object body) =>
      _send('PUT', path, body: body);

  Future<void> delete(String path) => _send('DELETE', path);

  /// Chiude le connessioni aperte (utile su mobile/desktop).
  void close() => _http.close();

  /// Costruisce l'URI finale. Con baseUrl vuoto resta relativo ("/api/items")
  /// e il browser lo risolve rispetto all'origine della pagina.
  Uri resolve(String path) => Uri.parse('$baseUrl$path');

  Future<Object?> _send(String method, String path, {Object? body}) async {
    final request = http.Request(method, resolve(path))
      ..headers.addAll(_jsonHeaders);
    if (body != null) request.body = jsonEncode(body);

    final http.Response response;
    try {
      final streamed = await _http.send(request).timeout(timeout);
      response = await http.Response.fromStream(streamed).timeout(timeout);
    } on TimeoutException {
      throw const ApiException.network('The request timed out.');
    } on http.ClientException catch (e) {
      // ClientException copre backend irraggiungibile, CORS bloccato, DNS...
      throw ApiException.network(e.message);
    } on ArgumentError catch (e) {
      // Es. URL relativo su mobile: serve API_BASE_URL assoluto.
      throw ApiException.network('Invalid API URL: ${e.message}');
    }

    final decoded = _decode(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }
    throw ApiException.fromProblem(response.statusCode, decoded);
  }

  /// Decodifica il corpo come JSON; restituisce null se vuoto (es. 204) o non
  /// JSON (es. pagina HTML di errore del proxy).
  static Object? _decode(http.Response response) {
    if (response.bodyBytes.isEmpty) return null;
    try {
      // utf8.decode esplicito: response.body userebbe latin1 se il server non
      // specifica il charset.
      return jsonDecode(utf8.decode(response.bodyBytes));
    } on FormatException {
      return null;
    }
  }

  static String _trimTrailingSlash(String url) =>
      url.endsWith('/') ? url.substring(0, url.length - 1) : url;
}
