// Widget test della pagina Items: lista, creazione, errori di validazione del
// server sui campi, modifica, eliminazione ed errore di caricamento.
import 'package:flutter/material.dart';
import 'package:flutter_template/data/api/api_exception.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/fakes.dart';

void main() {
  testWidgets('lists items from the repository', (tester) async {
    await pumpApp(tester, location: '/items');

    expect(find.text('Keyboard'), findsOneWidget);
    expect(find.text('Mouse'), findsOneWidget);
    expect(find.text('€ 49.90'), findsOneWidget);
  });

  testWidgets('client-side validation blocks an empty form', (tester) async {
    final repo = FakeItemsRepository();
    await pumpApp(tester, location: '/items', items: repo);

    await tester.tap(find.text('New item'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Create'));
    await tester.pumpAndSettle();

    expect(find.text('name is required'), findsOneWidget);
    expect(find.text('price is required'), findsOneWidget);
    expect(repo.items, hasLength(2));
  });

  testWidgets('creates an item', (tester) async {
    final repo = FakeItemsRepository();
    await pumpApp(tester, location: '/items', items: repo);

    await tester.tap(find.text('New item'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('item-name')), 'Monitor');
    await tester.enterText(find.byKey(const ValueKey('item-price')), '199,99');
    await tester.tap(find.widgetWithText(FilledButton, 'Create'));
    await tester.pumpAndSettle();

    expect(find.byType(AlertDialog), findsNothing);
    expect(find.text('Monitor'), findsOneWidget);
    expect(find.text('Item created'), findsOneWidget);
    expect(repo.items.last.price, 199.99);
  });

  testWidgets('shows Problem Details field errors from the server', (
    tester,
  ) async {
    final repo = FakeItemsRepository()
      ..nextSaveError = const ApiException(
        statusCode: 400,
        title: 'Validation failed',
        detail: 'One or more fields are invalid.',
        fieldErrors: {
          'name': ['name already exists'],
        },
      );
    await pumpApp(tester, location: '/items', items: repo);

    await tester.tap(find.text('New item'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('item-name')), 'Keyboard');
    await tester.enterText(find.byKey(const ValueKey('item-price')), '10');
    await tester.tap(find.widgetWithText(FilledButton, 'Create'));
    await tester.pumpAndSettle();

    // Il dialog resta aperto e mostra l'errore sul campo e quello generale.
    expect(find.byType(AlertDialog), findsOneWidget);
    expect(find.text('name already exists'), findsOneWidget);
    expect(
      find.text('Validation failed: One or more fields are invalid.'),
      findsOneWidget,
    );
  });

  testWidgets('edits an item', (tester) async {
    final repo = FakeItemsRepository();
    await pumpApp(tester, location: '/items', items: repo);

    await tester.tap(find.byTooltip('Edit').first);
    await tester.pumpAndSettle();
    expect(find.text('Edit item'), findsOneWidget);

    await tester.enterText(
      find.byKey(const ValueKey('item-name')),
      'Keyboard Pro',
    );
    await tester.tap(find.widgetWithText(FilledButton, 'Save'));
    await tester.pumpAndSettle();

    expect(find.text('Keyboard Pro'), findsOneWidget);
    expect(repo.items.first.name, 'Keyboard Pro');
  });

  testWidgets('deletes an item after confirmation', (tester) async {
    final repo = FakeItemsRepository();
    await pumpApp(tester, location: '/items', items: repo);

    await tester.tap(find.byTooltip('Delete').first);
    await tester.pumpAndSettle();
    expect(find.text('Delete item?'), findsOneWidget);

    await tester.tap(find.widgetWithText(FilledButton, 'Delete'));
    await tester.pumpAndSettle();

    expect(find.text('Keyboard'), findsNothing);
    expect(repo.items, hasLength(1));
  });

  testWidgets('shows an error with Retry when loading fails', (tester) async {
    final repo = FakeItemsRepository(failList: true);
    await pumpApp(tester, location: '/items', items: repo);

    expect(find.text('Could not load items'), findsOneWidget);

    repo.failList = false;
    await tester.tap(find.text('Retry'));
    await tester.pumpAndSettle();
    expect(find.text('Keyboard'), findsOneWidget);
  });

  testWidgets('shows the empty state', (tester) async {
    await pumpApp(
      tester,
      location: '/items',
      items: FakeItemsRepository(seed: []),
    );
    expect(find.text('No items yet'), findsOneWidget);
  });
}
