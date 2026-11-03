// Esempio: scala tipografica Material 3 (Theme.of(context).textTheme).
import 'package:flutter/material.dart';

import '../widgets/showcase_section.dart';

class TypographySection extends StatelessWidget {
  const TypographySection({super.key});

  static const _code = '''
Text('Headline', style: Theme.of(context).textTheme.headlineMedium);
Text('Body text', style: Theme.of(context).textTheme.bodyLarge);''';

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final styles = <String, TextStyle?>{
      'displaySmall': t.displaySmall,
      'headlineMedium': t.headlineMedium,
      'titleLarge': t.titleLarge,
      'titleMedium': t.titleMedium,
      'bodyLarge': t.bodyLarge,
      'bodyMedium': t.bodyMedium,
      'labelLarge': t.labelLarge,
      'bodySmall': t.bodySmall,
    };
    return ShowcaseSection(
      title: 'Typography',
      description: 'Use the theme text styles instead of hard-coded sizes.',
      code: _code,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final entry in styles.entries)
            Text(entry.key, style: entry.value),
        ],
      ),
    );
  }
}
