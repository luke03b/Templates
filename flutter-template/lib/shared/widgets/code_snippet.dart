// Blocco di codice con font monospazio e bottone "Copy" negli appunti.
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';
import 'app_snackbar.dart';

class CodeSnippet extends StatelessWidget {
  const CodeSnippet({super.key, required this.code});

  final String code;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Stack(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.xxl,
              AppSpacing.md,
            ),
            child: SelectableText(
              code.trim(),
              style: const TextStyle(
                fontFamily: AppTypography.monospace,
                fontSize: 13,
                height: 1.4,
              ),
            ),
          ),
          Positioned(
            top: AppSpacing.xs,
            right: AppSpacing.xs,
            child: IconButton(
              tooltip: 'Copy',
              icon: const Icon(Icons.copy, size: 18),
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: code.trim()));
                if (context.mounted) showAppSnackBar(context, 'Code copied');
              },
            ),
          ),
        ],
      ),
    );
  }
}
