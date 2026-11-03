// Cornice di ogni esempio della pagina Componenti: titolo, descrizione,
// anteprima live del widget e codice copiabile.
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/code_snippet.dart';

class ShowcaseSection extends StatelessWidget {
  const ShowcaseSection({
    super.key,
    required this.title,
    required this.description,
    required this.code,
    required this.child,
  });

  final String title;
  final String description;

  /// Esempio di codice mostrato sotto l'anteprima (copiabile).
  final String code;

  /// Anteprima live del componente.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: textTheme.titleLarge),
            const SizedBox(height: AppSpacing.xs),
            Text(description, style: textTheme.bodyMedium),
            const SizedBox(height: AppSpacing.md),
            child,
            const SizedBox(height: AppSpacing.md),
            ExpansionTile(
              tilePadding: EdgeInsets.zero,
              title: const Text('Show code'),
              childrenPadding: const EdgeInsets.only(bottom: AppSpacing.sm),
              children: [CodeSnippet(code: code)],
            ),
          ],
        ),
      ),
    );
  }
}
