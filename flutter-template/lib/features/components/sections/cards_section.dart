// Esempio: card Material 3 (outlined/filled) con contenuto e azioni.
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../widgets/showcase_section.dart';

class CardsSection extends StatelessWidget {
  const CardsSection({super.key});

  static const _code = '''
Card(
  child: Padding(
    padding: const EdgeInsets.all(AppSpacing.md),
    child: Column(children: [Text('Title'), Text('Content')]),
  ),
);
Card.filled(child: ...);''';

  @override
  Widget build(BuildContext context) {
    return const ShowcaseSection(
      title: 'Cards',
      description: 'Group related content. Styles come from cardTheme.',
      code: _code,
      child: Wrap(
        spacing: AppSpacing.md,
        runSpacing: AppSpacing.md,
        children: [
          InfoCard(
            icon: Icons.rocket_launch_outlined,
            title: 'Outlined card',
            body: 'Default card style defined in app_theme.dart.',
          ),
          InfoCard(
            icon: Icons.layers_outlined,
            title: 'Filled card',
            body: 'Uses Card.filled for a tonal background.',
            filled: true,
          ),
        ],
      ),
    );
  }
}

/// Card riutilizzabile con icona, titolo, testo e azione.
class InfoCard extends StatelessWidget {
  const InfoCard({
    super.key,
    required this.icon,
    required this.title,
    required this.body,
    this.filled = false,
  });

  final IconData icon;
  final String title;
  final String body;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final content = Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Theme.of(context).colorScheme.primary),
          const SizedBox(height: AppSpacing.sm),
          Text(title, style: textTheme.titleMedium),
          const SizedBox(height: AppSpacing.xs),
          Text(body, style: textTheme.bodyMedium),
          const SizedBox(height: AppSpacing.sm),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(onPressed: () {}, child: const Text('Action')),
          ),
        ],
      ),
    );
    return SizedBox(
      width: 280,
      child: filled ? Card.filled(child: content) : Card(child: content),
    );
  }
}
