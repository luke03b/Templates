// Pagina Home: presentazione del template e indicatore di stato del backend.
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/app_config.dart';
import '../../core/di/app_scope.dart';
import '../../core/router/app_routes.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/page_container.dart';
import '../../shared/widgets/status_indicator.dart';
import 'backend_status_controller.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  // `late final`: inizializzato una sola volta in initState (serve il context).
  late final BackendStatusController _controller;

  @override
  void initState() {
    super.initState();
    _controller = BackendStatusController(AppScope.of(context).healthRepository)
      ..check();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return PageContainer(
      children: [
        Text('Flutter Template', style: textTheme.displaySmall),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Material 3 starter for web, Android and iOS with routing, '
          'a typed API client and a complete CRUD example.',
          style: textTheme.bodyLarge,
        ),
        const SizedBox(height: AppSpacing.lg),
        // ListenableBuilder ricostruisce solo questa parte quando il
        // controller chiama notifyListeners().
        ListenableBuilder(
          listenable: _controller,
          builder: (context, _) => _BackendStatusCard(
            status: _controller.status,
            service: _controller.health?.service,
            onRefresh: _controller.status == ServiceStatus.checking
                ? null
                : _controller.check,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: [
            FilledButton.icon(
              onPressed: () => context.go(AppRoutes.items),
              icon: const Icon(Icons.inventory_2_outlined),
              label: const Text('Manage items'),
            ),
            OutlinedButton.icon(
              onPressed: () => context.go(AppRoutes.components),
              icon: const Icon(Icons.widgets_outlined),
              label: const Text('Browse components'),
            ),
          ],
        ),
      ],
    );
  }
}

class _BackendStatusCard extends StatelessWidget {
  const _BackendStatusCard({
    required this.status,
    required this.service,
    required this.onRefresh,
  });

  final ServiceStatus status;
  final String? service;
  final VoidCallback? onRefresh;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    const baseUrl = AppConfig.apiBaseUrl == ''
        ? '(relative /api)'
        : AppConfig.apiBaseUrl;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Backend', style: textTheme.labelLarge),
                  const SizedBox(height: AppSpacing.sm),
                  StatusIndicator(status: status),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    service == null ? baseUrl : '$service · $baseUrl',
                    style: textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            IconButton(
              tooltip: 'Check again',
              onPressed: onRefresh,
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
      ),
    );
  }
}
