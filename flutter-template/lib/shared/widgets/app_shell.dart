// Layout comune a tutte le pagine (mobile-first): AppBar + contenuto +
// navigazione. Sotto 600px la navigazione è una NavigationBar in basso,
// sopra diventa una NavigationRail laterale.
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/app_routes.dart';
import '../../core/theme/app_theme.dart';

/// Voce di menu: percorso, etichetta e icone.
class AppDestination {
  const AppDestination(this.path, this.label, this.icon, this.selectedIcon);

  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

const appDestinations = [
  AppDestination(AppRoutes.home, 'Home', Icons.home_outlined, Icons.home),
  AppDestination(
    AppRoutes.components,
    'Components',
    Icons.widgets_outlined,
    Icons.widgets,
  ),
  AppDestination(
    AppRoutes.items,
    'Items',
    Icons.inventory_2_outlined,
    Icons.inventory_2,
  ),
];

class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.location, required this.child});

  /// Percorso corrente, usato per evidenziare la voce di menu attiva.
  final String location;
  final Widget child;

  /// Indice della voce attiva, null se il percorso non è nel menu (es. 404).
  int? get _selectedIndex {
    final index = appDestinations.indexWhere((d) => d.path == location);
    return index < 0 ? null : index;
  }

  void _onSelect(BuildContext context, int index) =>
      context.go(appDestinations[index].path);

  @override
  Widget build(BuildContext context) {
    final isCompact = MediaQuery.sizeOf(context).width < AppBreakpoints.medium;

    return Scaffold(
      appBar: AppBar(title: const Text('Flutter Template')),
      body: SafeArea(
        child: isCompact
            ? child
            : Row(
                children: [
                  NavigationRail(
                    selectedIndex: _selectedIndex,
                    onDestinationSelected: (i) => _onSelect(context, i),
                    labelType: NavigationRailLabelType.all,
                    destinations: [
                      for (final d in appDestinations)
                        NavigationRailDestination(
                          icon: Icon(d.icon),
                          selectedIcon: Icon(d.selectedIcon),
                          label: Text(d.label),
                        ),
                    ],
                  ),
                  const VerticalDivider(width: 1),
                  Expanded(child: child),
                ],
              ),
      ),
      bottomNavigationBar: isCompact
          ? NavigationBar(
              // NavigationBar richiede sempre una voce selezionata.
              selectedIndex: _selectedIndex ?? 0,
              onDestinationSelected: (i) => _onSelect(context, i),
              destinations: [
                for (final d in appDestinations)
                  NavigationDestination(
                    icon: Icon(d.icon),
                    selectedIcon: Icon(d.selectedIcon),
                    label: d.label,
                  ),
              ],
            )
          : null,
    );
  }
}
