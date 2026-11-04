// Root widget dell'app: collega tema, router e dipendenze (repository).
// Le dipendenze sono parametri così i test possono passare versioni finte.
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/di/app_scope.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'data/repositories/health_repository.dart';
import 'data/repositories/items_repository.dart';

class App extends StatefulWidget {
  const App({
    super.key,
    required this.healthRepository,
    required this.itemsRepository,
    this.initialLocation = '/',
  });

  final HealthRepository healthRepository;
  final ItemsRepository itemsRepository;
  final String initialLocation;

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  // Il router va creato una sola volta (non in build), altrimenti a ogni
  // rebuild si perderebbe la navigazione.
  late final GoRouter _router = createRouter(
    initialLocation: widget.initialLocation,
  );

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScope(
      healthRepository: widget.healthRepository,
      itemsRepository: widget.itemsRepository,
      child: MaterialApp.router(
        title: 'Flutter Template',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        // Segue l'impostazione chiaro/scuro del sistema operativo.
        themeMode: ThemeMode.system,
        routerConfig: _router,
      ),
    );
  }
}
