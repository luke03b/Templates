// Test del repository HTTP degli items (rotte, metodi e parsing dei modelli)
// con MockClient: verifica il rispetto del contratto API.
import 'dart:convert';

import 'package:flutter_template/data/api/api_client.dart';
import 'package:flutter_template/data/models/item.dart';
import 'package:flutter_template/data/repositories/health_repository.dart';
import 'package:flutter_template/data/repositories/items_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

const _itemJson = {
  'id': '6f1c2a5e-0000-4000-8000-000000000001',
  'name': 'Keyboard',
  'description': null,
  'price': 49,
  'createdAt': '2026-11-03T18:00:00Z',
  'updatedAt': '2026-11-03T18:00:00Z',
};

void main() {
  final requests = <http.Request>[];

  ApiClient clientReturning(Object? body, int status) {
    requests.clear();
    return ApiClient(
      baseUrl: 'http://api.test',
      httpClient: MockClient((request) async {
        requests.add(request);
        return http.Response(
          body == null ? '' : jsonEncode(body),
          status,
          headers: {'content-type': 'application/json'},
        );
      }),
    );
  }

  test('list parses an array of items', () async {
    final repo = HttpItemsRepository(clientReturning([_itemJson], 200));
    final items = await repo.list();

    expect(requests.single.url.path, '/api/items');
    expect(items.single.name, 'Keyboard');
    expect(items.single.price, 49.0);
    expect(items.single.description, isNull);
    expect(items.single.createdAt, DateTime.utc(2026, 11, 3, 18));
  });

  test('create POSTs ItemInput and trims fields', () async {
    final repo = HttpItemsRepository(clientReturning(_itemJson, 201));
    await repo.create(
      const ItemInput(name: '  Keyboard ', description: '  ', price: 49),
    );

    final request = requests.single;
    expect(request.method, 'POST');
    expect(request.url.path, '/api/items');
    expect(jsonDecode(request.body), {
      'name': 'Keyboard',
      'description': null,
      'price': 49.0,
    });
  });

  test('update PUTs to /api/items/{id}', () async {
    final repo = HttpItemsRepository(clientReturning(_itemJson, 200));
    await repo.update('abc', const ItemInput(name: 'A', price: 1));

    expect(requests.single.method, 'PUT');
    expect(requests.single.url.path, '/api/items/abc');
  });

  test('delete sends DELETE to /api/items/{id}', () async {
    final repo = HttpItemsRepository(clientReturning(null, 204));
    await repo.delete('abc');

    expect(requests.single.method, 'DELETE');
    expect(requests.single.url.path, '/api/items/abc');
  });

  test('health repository parses /api/health', () async {
    final repo = HttpHealthRepository(
      clientReturning({
        'status': 'ok',
        'service': 'nodejs-backend-template',
        'timestamp': '2026-11-03T18:00:00Z',
      }, 200),
    );
    final health = await repo.check();

    expect(requests.single.url.path, '/api/health');
    expect(health.isOk, isTrue);
    expect(health.service, 'nodejs-backend-template');
  });
}
