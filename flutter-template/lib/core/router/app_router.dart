// Configurazione del routing con go_router (pacchetto ufficiale del team
// Flutter). Una ShellRoute avvolge tutte le pagine nello stesso layout
// (AppShell con la navigazione), mentre errorBuilder gestisce il 404.
import 'package:go_router/go_router.dart';

import '../../features/components/components_page.dart';
import '../../features/home/home_page.dart';
import '../../features/items/items_page.dart';
import '../../features/not_found/not_found_page.dart';
import '../../shared/widgets/app_shell.dart';
import 'app_routes.dart';

/// Crea un nuovo router. È una funzione (non una variabile globale) così ogni
/// test parte da un router pulito; [initialLocation] serve ai test.
GoRouter createRouter({String initialLocation = AppRoutes.home}) {
  return GoRouter(
    initialLocation: initialLocation,
    routes: [
      ShellRoute(
        builder: (context, state, child) =>
            AppShell(location: state.uri.path, child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            // NoTransitionPage: niente animazione cambiando voce di menu.
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: HomePage()),
          ),
          GoRoute(
            path: AppRoutes.components,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ComponentsPage()),
          ),
          GoRoute(
            path: AppRoutes.items,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ItemsPage()),
          ),
          // Per aggiungere una pagina: crea features/<nome>/<nome>_page.dart,
          // aggiungi il percorso in AppRoutes e una GoRoute qui (e, se serve,
          // una voce di menu in AppShell).
        ],
      ),
    ],
    // Qualsiasi percorso sconosciuto: pagina 404 dentro lo stesso layout.
    errorBuilder: (context, state) =>
        AppShell(location: state.uri.path, child: const NotFoundPage()),
  );
}
