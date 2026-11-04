// Esempio: feedback all'utente con alert inline, snackbar (toast) e dialog.
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_alert.dart';
import '../../../shared/widgets/app_snackbar.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../widgets/showcase_section.dart';

class FeedbackSection extends StatelessWidget {
  const FeedbackSection({super.key});

  static const _code = '''
const AppAlert(variant: AlertVariant.success, message: 'Saved');

showAppSnackBar(context, 'Item created');
showAppSnackBar(context, 'Something went wrong', isError: true);

final ok = await showConfirmDialog(
  context,
  title: 'Delete item?',
  message: 'This cannot be undone.',
  isDestructive: true,
);''';

  Future<void> _openDialog(BuildContext context) async {
    final confirmed = await showConfirmDialog(
      context,
      title: 'Confirm action',
      message: 'Do you want to continue?',
    );
    if (context.mounted) {
      showAppSnackBar(context, confirmed ? 'Confirmed' : 'Cancelled');
    }
  }

  @override
  Widget build(BuildContext context) {
    const gap = SizedBox(height: AppSpacing.sm);
    return ShowcaseSection(
      title: 'Alerts, toasts and dialogs',
      description: 'Inline alerts, temporary snackbars and modal dialogs.',
      code: _code,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const AppAlert(message: 'This is an informative message.'),
          gap,
          const AppAlert(
            variant: AlertVariant.success,
            title: 'Success',
            message: 'The operation completed.',
          ),
          gap,
          const AppAlert(
            variant: AlertVariant.warning,
            message: 'Check your input before continuing.',
          ),
          gap,
          const AppAlert(
            variant: AlertVariant.error,
            title: 'Error',
            message: 'Something went wrong.',
          ),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              OutlinedButton(
                onPressed: () => showAppSnackBar(context, 'Hello from a toast'),
                child: const Text('Show toast'),
              ),
              OutlinedButton(
                onPressed: () =>
                    showAppSnackBar(context, 'An error toast', isError: true),
                child: const Text('Show error toast'),
              ),
              FilledButton.tonal(
                onPressed: () => _openDialog(context),
                child: const Text('Open dialog'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
