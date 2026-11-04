// Esempio: navigazione tra pagine con go_router e SegmentedButton come
// navigazione locale tra viste della stessa pagina.
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_routes.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/showcase_section.dart';

enum _View { day, week, month }

class NavigationSection extends StatefulWidget {
  const NavigationSection({super.key});

  @override
  State<NavigationSection> createState() => _NavigationSectionState();
}

class _NavigationSectionState extends State<NavigationSection> {
  _View _view = _View.week;

  static const _code = '''
// Cambio pagina (sostituisce la rotta corrente)
context.go(AppRoutes.items);
// Apre una pagina sopra la corrente (con "indietro")
context.push('/items/42');

SegmentedButton<View>(
  segments: const [ButtonSegment(value: View.day, label: Text('Day')), ...],
  selected: {view},
  onSelectionChanged: (s) => setState(() => view = s.first),
);''';

  @override
  Widget build(BuildContext context) {
    return ShowcaseSection(
      title: 'Navigation',
      description:
          'Main menu is in AppShell (bottom bar on mobile, rail on wide '
          'screens). Use context.go() to change page.',
      code: _code,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SegmentedButton<_View>(
            segments: const [
              ButtonSegment(value: _View.day, label: Text('Day')),
              ButtonSegment(value: _View.week, label: Text('Week')),
              ButtonSegment(value: _View.month, label: Text('Month')),
            ],
            selected: {_view},
            onSelectionChanged: (s) => setState(() => _view = s.first),
          ),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              OutlinedButton.icon(
                onPressed: () => context.go(AppRoutes.home),
                icon: const Icon(Icons.home_outlined),
                label: const Text('Go to Home'),
              ),
              OutlinedButton.icon(
                onPressed: () => context.go('/does-not-exist'),
                icon: const Icon(Icons.explore_off_outlined),
                label: const Text('Go to 404'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
