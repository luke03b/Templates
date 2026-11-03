// Esempio: indicatori di caricamento circolari e lineari.
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../widgets/showcase_section.dart';

class LoadingSection extends StatelessWidget {
  const LoadingSection({super.key});

  static const _code = '''
const CircularProgressIndicator();          // indeterminato
const LinearProgressIndicator(value: 0.6);  // determinato (0..1)''';

  @override
  Widget build(BuildContext context) {
    return const ShowcaseSection(
      title: 'Spinners and progress',
      description: 'Indeterminate and determinate progress indicators.',
      code: _code,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              CircularProgressIndicator(),
              SizedBox(width: AppSpacing.lg),
              CircularProgressIndicator(value: 0.7),
              SizedBox(width: AppSpacing.lg),
              SizedBox.square(
                dimension: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ],
          ),
          SizedBox(height: AppSpacing.lg),
          LinearProgressIndicator(),
          SizedBox(height: AppSpacing.md),
          LinearProgressIndicator(value: 0.6),
        ],
      ),
    );
  }
}
