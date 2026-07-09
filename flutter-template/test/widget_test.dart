import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_template/main.dart';

void main() {
  testWidgets('landing page renders core actions', (tester) async {
    await tester.pumpWidget(const TemplateApp());

    expect(find.text('Build something clean from day one.'), findsOneWidget);
    expect(find.text('Get started'), findsOneWidget);
    expect(find.text('View docs'), findsOneWidget);
  });
}
