// Test del client API con MockClient di package:http: nessuna rete reale,
// ogni test decide la risposta del "server" e verifica la richiesta inviata.
import 'dart:convert';

import 'package:flutter_template/data/api/api_client.dart';
import 'package:flutter_template/data/api/api_exception.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

http.Response jsonResponse(Object? body, int status, {String? type}) =>
    http.Response(
      jsonEncode(body),
      status,
      headers: {'content-type': type ?? 'application/json'},
    );

void main() {
  group('ApiClient', () {
    test('builds absolute URLs from baseUrl and trims trailing slash', () {
      final client = ApiClient(baseUrl: 'http://localhost:3000/');
      expect(
        client.resolve('/api/items').toString(),
        'http://localhost:3000/api/items',
      );
    });

    test('keeps URLs relative when baseUrl is empty', () {
      final client = ApiClient(baseUrl: '');
      final uri = client.resolve('/api/health');
      expect(uri.hasScheme, isFalse);
      expect(uri.path, '/api/health');
    });

    test('GET decodes JSON and sends Accept header', () async {
      late http.Request sent;
      final client = ApiClient(
        baseUrl: 'http://api.test',
        httpClient: MockClient((request) async {
          sent = request;
          return jsonResponse({'status': 'ok'}, 200);
        }),
      );

      final result = await client.get('/api/health');

      expect(result, {'status': 'ok'});
      expect(sent.method, 'GET');
      expect(sent.url.toString(), 'http://api.test/api/health');
      expect(sent.headers['Accept'], 'application/json');
    });

    test('POST sends a JSON body', () async {
      late http.Request sent;
      final client = ApiClient(
        baseUrl: 'http://api.test',
        httpClient: MockClient((request) async {
          sent = request;
          return jsonResponse({'id': '1'}, 201);
        }),
      );

      await client.post('/api/items', {'name': 'A', 'price': 1});

      expect(sent.method, 'POST');
      expect(sent.headers['Content-Type'], startsWith('application/json'));
      expect(jsonDecode(sent.body), {'name': 'A', 'price': 1});
    });

    test('DELETE with 204 and empty body completes', () async {
      final client = ApiClient(
        baseUrl: 'http://api.test',
        httpClient: MockClient((_) async => http.Response('', 204)),
      );
      await expectLater(client.delete('/api/items/1'), completes);
    });

    test(
      '400 Problem Details becomes ApiException with field errors',
      () async {
        final client = ApiClient(
          baseUrl: 'http://api.test',
          httpClient: MockClient(
            (_) async => jsonResponse(
              {
                'type': 'about:blank',
                'title': 'Validation failed',
                'status': 400,
                'detail': 'One or more fields are invalid.',
                'errors': {
                  'name': ['name is required'],
                  'price': ['price must be greater than or equal to 0'],
                },
              },
              400,
              type: 'application/problem+json',
            ),
          ),
        );

        final error = await client
            .post('/api/items', {})
            .then<ApiException?>(
              (_) => null,
              onError: (Object e) => e as ApiException,
            );

        expect(error, isNotNull);
        expect(error!.isValidationError, isTrue);
        expect(error.title, 'Validation failed');
        expect(error.fieldError('name'), 'name is required');
        expect(error.fieldErrors['price'], hasLength(1));
      },
    );

    test('404 becomes ApiException.isNotFound', () async {
      final client = ApiClient(
        baseUrl: 'http://api.test',
        httpClient: MockClient(
          (_) async => jsonResponse({
            'title': 'Not Found',
            'status': 404,
            'detail': 'Item not found',
          }, 404),
        ),
      );

      expect(
        () => client.get('/api/items/x'),
        throwsA(
          isA<ApiException>()
              .having((e) => e.isNotFound, 'isNotFound', isTrue)
              .having((e) => e.fieldErrors, 'fieldErrors', isEmpty),
        ),
      );
    });

    test('non-JSON 502 from the proxy gets a generic title', () async {
      final client = ApiClient(
        baseUrl: 'http://api.test',
        httpClient: MockClient(
          (_) async => http.Response('<html>Bad Gateway</html>', 502),
        ),
      );

      expect(
        () => client.get('/api/health'),
        throwsA(
          isA<ApiException>()
              .having((e) => e.statusCode, 'statusCode', 502)
              .having((e) => e.title, 'title', 'Server error'),
        ),
      );
    });

    test('connection errors become network ApiException', () async {
      final client = ApiClient(
        baseUrl: 'http://api.test',
        httpClient: MockClient(
          (_) async => throw http.ClientException('Connection refused'),
        ),
      );

      expect(
        () => client.get('/api/health'),
        throwsA(
          isA<ApiException>().having(
            (e) => e.isNetworkError,
            'isNetworkError',
            isTrue,
          ),
        ),
      );
    });

    test('slow responses time out as network errors', () async {
      final client = ApiClient(
        baseUrl: 'http://api.test',
        timeout: const Duration(milliseconds: 10),
        httpClient: MockClient((_) async {
          await Future<void>.delayed(const Duration(milliseconds: 200));
          return jsonResponse({}, 200);
        }),
      );

      expect(
        () => client.get('/api/health'),
        throwsA(
          isA<ApiException>().having(
            (e) => e.detail,
            'detail',
            contains('timed out'),
          ),
        ),
      );
    });
  });
}
