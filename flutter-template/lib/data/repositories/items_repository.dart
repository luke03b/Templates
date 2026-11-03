// Repository della risorsa items: traduce le operazioni CRUD in chiamate
// REST verso /api/items. È l'unico punto che conosce le rotte della risorsa.
//
// `abstract interface class` (Dart 3) = contratto che le classi devono
// implementare con `implements`, senza ereditare codice.
import '../api/api_client.dart';
import '../models/item.dart';

abstract interface class ItemsRepository {
  Future<List<Item>> list();
  Future<Item> get(String id);
  Future<Item> create(ItemInput input);
  Future<Item> update(String id, ItemInput input);
  Future<void> delete(String id);
}

class HttpItemsRepository implements ItemsRepository {
  HttpItemsRepository(this._client);

  static const _basePath = '/api/items';

  final ApiClient _client;

  @override
  Future<List<Item>> list() async {
    final json = await _client.get(_basePath);
    return (json! as List)
        .map((e) => Item.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<Item> get(String id) async =>
      _toItem(await _client.get('$_basePath/${Uri.encodeComponent(id)}'));

  @override
  Future<Item> create(ItemInput input) async =>
      _toItem(await _client.post(_basePath, input.toJson()));

  @override
  Future<Item> update(String id, ItemInput input) async => _toItem(
    await _client.put('$_basePath/${Uri.encodeComponent(id)}', input.toJson()),
  );

  @override
  Future<void> delete(String id) =>
      _client.delete('$_basePath/${Uri.encodeComponent(id)}');

  static Item _toItem(Object? json) =>
      Item.fromJson(json! as Map<String, dynamic>);
}
