// Esempio: badge (contatori sulle icone) e chip (etichette, filtri).
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../widgets/showcase_section.dart';

class BadgesSection extends StatefulWidget {
  const BadgesSection({super.key});

  @override
  State<BadgesSection> createState() => _BadgesSectionState();
}

class _BadgesSectionState extends State<BadgesSection> {
  final Set<String> _filters = {'Flutter'};

  static const _code = '''
Badge.count(count: 3, child: const Icon(Icons.notifications_outlined));
const Badge(child: Icon(Icons.mail_outline)); // solo pallino
const Chip(label: Text('Label'));
FilterChip(label: const Text('Flutter'), selected: true, onSelected: (v) {});''';

  @override
  Widget build(BuildContext context) {
    return ShowcaseSection(
      title: 'Badges and chips',
      description: 'Counters on icons, labels and selectable filters.',
      code: _code,
      child: Wrap(
        spacing: AppSpacing.md,
        runSpacing: AppSpacing.md,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Badge.count(
            count: 3,
            child: const Icon(Icons.notifications_outlined),
          ),
          const Badge(child: Icon(Icons.mail_outline)),
          const Chip(label: Text('Default chip')),
          Chip(
            avatar: const Icon(Icons.check, size: 18),
            label: const Text('With icon'),
            onDeleted: () {},
          ),
          for (final filter in ['Flutter', 'Dart', 'Material'])
            FilterChip(
              label: Text(filter),
              selected: _filters.contains(filter),
              onSelected: (selected) => setState(
                () => selected ? _filters.add(filter) : _filters.remove(filter),
              ),
            ),
        ],
      ),
    );
  }
}
