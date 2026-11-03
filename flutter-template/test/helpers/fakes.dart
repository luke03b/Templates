// Implementazioni finte dei repository e helper per montare l'app nei test.
// Grazie alle interfacce (HealthRepository, ItemsRepository) le pagine si
// testano senza rete.
import 'package:flutter/material.dart';
import 'package:flutter_template/app.dart';
import 'package:flutter_template/data/api/api_exception.dart';
import 'package:flutter_template/data/models/health_status.dart';
import 'package:flutter_template/data/models/item.dart';
import 'package:flutter_template/data/repositories/health_repository.dart';
import 'package:flutter_template/data/repositories/items_repository.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeHealthRepository implements HealthRepository {
  FakeHealthRepository({this.online = true});

  bool online;

  @override
  Future<HealthStatus> check() async {
    if (!online) throw const ApiException.network();
    return HealthStatus(
      status: 'ok',
      service: 'fake-backend',
      timestamp: DateTime.utc(2026, 11, 3),
    );
  }
}

/// Repository in memoria che imita le regole di validazione del backend.
class FakeItemsRepository implements ItemsRepository {
  FakeItemsRepository({List<Item>? seed, this.failList = false})
    : _items = [...(seed ?? sampleItems)];

  final List<Item> _items;
  bool failList;
  int _nextId = 100;

  /// Se impostato, create/update lanciano questo errore (es. validazione 400).
  ApiException? nextSaveError;

  List<Item> get items => List.unmodifiable(_items);

  @override
  Future<List<Item>> list() async {
    if (failList) {
      throw const ApiException(statusCode: 500, title: 'Server error');
    }
    return List.of(_items);
  }

  @override
  Future<Item> get(String id) async => _items.firstWhere(
    (i) => i.id == id,
    orElse: () => throw const ApiException(statusCode: 404, title: 'Not found'),
  );

  @override
  Future<Item> create(ItemInput input) async {
    _throwIfSaveError();
    final item = _build('${_nextId++}', input, DateTime.utc(2026, 11, 3));
    _items.add(item);
    return item;
  }

  @override
  Future<Item> update(String id, ItemInput input) async {
    _throwIfSaveError();
    final existing = await get(id);
    final updated = _build(id, input, existing.createdAt);
    _items[_items.indexOf(existing)] = updated;
    return updated;
  }

  @override
  Future<void> delete(String id) async {
    final existing = await get(id);
    _items.remove(existing);
  }

  void _throwIfSaveError() {
    final error = nextSaveError;
    nextSaveError = null;
    if (error != null) throw error;
  }

  static Item _build(String id, ItemInput input, DateTime createdAt) {
    final json = input.toJson();
    return Item(
      id: id,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: input.price,
      createdAt: createdAt,
      updatedAt: DateTime.utc(2026, 11, 3, 12),
    );
  }
}

final sampleItems = [
  Item(
    id: '1',
    name: 'Keyboard',
    description: 'Mechanical keyboard',
    price: 49.9,
    createdAt: DateTime.utc(2026, 11, 1),
    updatedAt: DateTime.utc(2026, 11, 1),
  ),
  Item(
    id: '2',
    name: 'Mouse',
    description: null,
    price: 19.5,
    createdAt: DateTime.utc(2026, 11, 2),
    updatedAt: DateTime.utc(2026, 11, 2),
  ),
];

/// Monta l'app completa (router + tema) con repository finti.
Future<void> pumpApp(
  WidgetTester tester, {
  String location = '/',
  HealthRepository? health,
  ItemsRepository? items,
  Size size = const Size(1024, 900),
  bool settle = true,
}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);

  await tester.pumpWidget(
    App(
      initialLocation: location,
      healthRepository: health ?? FakeHealthRepository(),
      itemsRepository: items ?? FakeItemsRepository(),
    ),
  );
  // Le pagine con animazioni infinite (spinner indeterminati) non si
  // "assestano" mai: in quel caso si avanza di un tempo fisso.
  settle ? await tester.pumpAndSettle() : await tester.pump(_frame);
}

const _frame = Duration(milliseconds: 500);

/// Avanza il tempo di mezzo secondo (alternativa a pumpAndSettle).
Future<void> pumpFrames(WidgetTester tester) => tester.pump(_frame);

/// Helper per trovare il testo dentro un Widget di un certo tipo.
Finder textIn<T extends Widget>(String text) =>
    find.descendant(of: find.byType(T), matching: find.text(text));
