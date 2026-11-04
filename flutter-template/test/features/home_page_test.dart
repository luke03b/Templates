// Widget test della Home: indicatore di stato Online/Offline e navigazione.
import 'package:flutter/material.dart';
import 'package:flutter_template/shared/widgets/status_indicator.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/fakes.dart';

void main() {
  testWidgets('shows Online when the backend answers', (tester) async {
    await pumpApp(tester, health: FakeHealthRepository(online: true));

    expect(find.text('Flutter Template'), findsWidgets);
    expect(textIn<StatusIndicator>('Online'), findsOneWidget);
  });

  testWidgets('shows Offline and can retry', (tester) async {
    final health = FakeHealthRepository(online: false);
    await pumpApp(tester, health: health);

    expect(textIn<StatusIndicator>('Offline'), findsOneWidget);

    health.online = true;
    await tester.tap(find.byTooltip('Check again'));
    await tester.pumpAndSettle();
    expect(textIn<StatusIndicator>('Online'), findsOneWidget);
  });

  testWidgets('quick action navigates to Items', (tester) async {
    await pumpApp(tester);

    await tester.tap(find.text('Manage items'));
    await tester.pumpAndSettle();

    expect(find.text('New item'), findsOneWidget);
  });

  testWidgets('uses a bottom NavigationBar on narrow screens', (tester) async {
    await pumpApp(tester, size: const Size(390, 844));

    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.byType(NavigationRail), findsNothing);

    await tester.tap(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.text('Components'),
      ),
    );
    // La pagina Componenti contiene spinner animati: niente pumpAndSettle.
    await pumpFrames(tester);
    expect(find.text('Typography'), findsOneWidget);
  });
}
