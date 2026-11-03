// Bottone con stato di caricamento: mentre [isLoading] è true mostra uno
// spinner ed è disabilitato (evita doppi invii dei form).
import 'package:flutter/material.dart';

class LoadingButton extends StatelessWidget {
  const LoadingButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
  });

  final String label;

  /// null = bottone disabilitato.
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final Widget? leading = isLoading
        ? const SizedBox.square(
            dimension: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
        : (icon != null ? Icon(icon) : null);

    return FilledButton.icon(
      onPressed: isLoading ? null : onPressed,
      icon: leading,
      label: Text(label),
    );
  }
}
