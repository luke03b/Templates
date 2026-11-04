// Indicatore di stato: pallino colorato + etichetta. Puramente visuale: lo
// stato arriva dall'esterno (vedi BackendStatusController).
import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

enum ServiceStatus { checking, online, offline }

class StatusIndicator extends StatelessWidget {
  const StatusIndicator({super.key, required this.status});

  final ServiceStatus status;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final (color, label) = switch (status) {
      ServiceStatus.checking => (colorScheme.outline, 'Checking...'),
      ServiceStatus.online => (AppColors.success, 'Online'),
      ServiceStatus.offline => (colorScheme.error, 'Offline'),
    };

    // Semantics: i lettori di schermo annunciano lo stato come testo.
    return Semantics(
      label: 'Backend status: $label',
      excludeSemantics: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            key: const ValueKey('status-dot'),
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(label, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}
