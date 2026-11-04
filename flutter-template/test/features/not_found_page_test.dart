// Widget test della pagina 404 e del ritorno alla Home.
import 'package:flutter_test/flutter_test.dart';

import '../helpers/fakes.dart';

void main() {
  testWidgets('unknown routes show the 404 page', (tester) async {
    await pumpApp(tester, location: '/does-not-exist');

    expect(find.text('404 - Page not found'), findsOneWidget);

    await tester.tap(find.text('Back to home'));
    await tester.pumpAndSettle();
    expect(find.text('Manage items'), findsOneWidget);
  });
}
