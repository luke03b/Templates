// Box di avviso inline (info/successo/avviso/errore) con icona e testo.
// Da usare per messaggi persistenti nella pagina; per notifiche temporanee
// usare showAppSnackBar.
import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

enum AlertVariant { info, success, warning, error }

class AppAlert extends StatelessWidget {
  const AppAlert({
    super.key,
    required this.message,
    this.title,
    this.variant = AlertVariant.info,
    this.action,
  });

  final String message;
  final String? title;
  final AlertVariant variant;

  /// Widget opzionale a destra, es. un TextButton "Retry".
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final (color, icon) = switch (variant) {
      AlertVariant.info => (colorScheme.primary, Icons.info_outline),
      AlertVariant.success => (AppColors.success, Icons.check_circle_outline),
      AlertVariant.warning => (AppColors.warning, Icons.warning_amber),
      AlertVariant.error => (colorScheme.error, Icons.error_outline),
    };
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null)
                  Text(
                    title!,
                    style: textTheme.titleSmall?.copyWith(color: color),
                  ),
                Text(message, style: textTheme.bodyMedium),
              ],
            ),
          ),
          ?action,
        ],
      ),
    );
  }
}
