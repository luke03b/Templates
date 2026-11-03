// Widget test della pagina Componenti: rendering delle sezioni e
// interazioni principali (validazione form, toast, dialog, tab).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/fakes.dart';

void main() {
  testWidgets('renders all showcase sections', (tester) async {
    await pumpApp(tester, location: '/components', settle: false);

    for (final title in [
      'Typography',
      'Buttons',
      'Form fields',
      'Cards',
      'Alerts, toasts and dialogs',
      'Tabs',
      'Lists and tables',
      'Badges and chips',
      'Spinners and progress',
      'Navigation',
    ]) {
      await tester.scrollUntilVisible(
        find.text(title),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text(title), findsOneWidget);
    }
  });

  testWidgets('demo form shows validation errors', (tester) async {
    await pumpApp(tester, location: '/components', settle: false);

    final submit = find.widgetWithText(FilledButton, 'Submit');
    await tester.scrollUntilVisible(
      submit,
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(submit);
    await pumpFrames(tester);

    expect(find.text('This field is required'), findsNWidgets(2));
    expect(find.text('Select a role'), findsOneWidget);
    expect(find.text('You must accept the terms'), findsOneWidget);
  });

  testWidgets('toast and dialog open from the feedback section', (
    tester,
  ) async {
    await pumpApp(tester, location: '/components', settle: false);

    final toast = find.text('Show toast');
    await tester.scrollUntilVisible(
      toast,
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(toast);
    await tester.pump();
    expect(find.text('Hello from a toast'), findsOneWidget);

    await tester.tap(find.text('Open dialog'));
    await pumpFrames(tester);
    expect(find.text('Confirm action'), findsOneWidget);
    await tester.tap(find.text('Cancel'));
    await pumpFrames(tester);
    expect(find.text('Confirm action'), findsNothing);
  });

  testWidgets('loading button shows a spinner while busy', (tester) async {
    await pumpApp(tester, location: '/components', settle: false);

    await tester.tap(find.text('Click to load'));
    await tester.pump();
    expect(find.text('Saving...'), findsOneWidget);

    await tester.pump(const Duration(seconds: 2));
    await pumpFrames(tester);
    expect(find.text('Click to load'), findsOneWidget);
  });
}
