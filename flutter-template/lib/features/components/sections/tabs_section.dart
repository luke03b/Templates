// Esempio: tab con DefaultTabController (gestisce da solo la tab attiva).
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../widgets/showcase_section.dart';

class TabsSection extends StatelessWidget {
  const TabsSection({super.key});

  static const _code = '''
DefaultTabController(
  length: 2,
  child: Column(children: [
    const TabBar(tabs: [Tab(text: 'One'), Tab(text: 'Two')]),
    SizedBox(height: 120, child: TabBarView(children: [Text('1'), Text('2')])),
  ]),
);''';

  @override
  Widget build(BuildContext context) {
    return ShowcaseSection(
      title: 'Tabs',
      description: 'Switch between related views.',
      code: _code,
      child: DefaultTabController(
        length: 3,
        child: Column(
          children: [
            const TabBar(
              tabs: [
                Tab(text: 'Overview', icon: Icon(Icons.dashboard_outlined)),
                Tab(text: 'Details', icon: Icon(Icons.list_alt)),
                Tab(text: 'Settings', icon: Icon(Icons.settings_outlined)),
              ],
            ),
            SizedBox(
              height: 96,
              child: TabBarView(
                children: [
                  for (final label in ['Overview', 'Details', 'Settings'])
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Text('$label content'),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
