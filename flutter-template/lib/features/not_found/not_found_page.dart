// Pagina 404: mostrata da go_router (errorBuilder) per percorsi sconosciuti.
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/app_routes.dart';
import '../../shared/widgets/empty_state.dart';

class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: EmptyState(
        icon: Icons.explore_off_outlined,
        title: '404 - Page not found',
        message: 'The page you are looking for does not exist.',
        action: FilledButton(
          onPressed: () => context.go(AppRoutes.home),
          child: const Text('Back to home'),
        ),
      ),
    );
  }
}
