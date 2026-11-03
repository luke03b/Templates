// Esempio: varianti di bottoni Material 3, stato disabilitato e loading.
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_button.dart';
import '../widgets/showcase_section.dart';

class ButtonsSection extends StatefulWidget {
  const ButtonsSection({super.key});

  @override
  State<ButtonsSection> createState() => _ButtonsSectionState();
}

class _ButtonsSectionState extends State<ButtonsSection> {
  bool _loading = false;

  static const _code = '''
FilledButton(onPressed: () {}, child: const Text('Filled'));
FilledButton.tonal(onPressed: () {}, child: const Text('Tonal'));
OutlinedButton(onPressed: () {}, child: const Text('Outlined'));
TextButton(onPressed: () {}, child: const Text('Text'));
FilledButton(onPressed: null, child: const Text('Disabled')); // null = disabled
LoadingButton(label: 'Save', isLoading: saving, onPressed: save);''';

  Future<void> _simulateLoading() async {
    setState(() => _loading = true);
    await Future<void>.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return ShowcaseSection(
      title: 'Buttons',
      description: 'Variants, icons, disabled and loading state.',
      code: _code,
      child: Wrap(
        spacing: AppSpacing.sm,
        runSpacing: AppSpacing.sm,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          FilledButton(onPressed: () {}, child: const Text('Filled')),
          FilledButton.tonal(onPressed: () {}, child: const Text('Tonal')),
          ElevatedButton(onPressed: () {}, child: const Text('Elevated')),
          OutlinedButton(onPressed: () {}, child: const Text('Outlined')),
          TextButton(onPressed: () {}, child: const Text('Text')),
          FilledButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add),
            label: const Text('With icon'),
          ),
          IconButton.filledTonal(
            tooltip: 'Favorite',
            onPressed: () {},
            icon: const Icon(Icons.favorite_border),
          ),
          const FilledButton(onPressed: null, child: Text('Disabled')),
          LoadingButton(
            label: _loading ? 'Saving...' : 'Click to load',
            isLoading: _loading,
            icon: Icons.save_outlined,
            onPressed: _simulateLoading,
          ),
        ],
      ),
    );
  }
}
