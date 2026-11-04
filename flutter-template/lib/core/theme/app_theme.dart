// Unico file di tema dell'app: contiene i design token (colori, spaziature,
// raggi, breakpoint, tipografia) e costruisce i ThemeData Material 3
// chiaro/scuro. Per cambiare l'aspetto dell'app si modifica SOLO questo file.
//
// Regola: nei widget non usare colori o numeri "magici" (Color(0xFF...),
// EdgeInsets.all(13)...) ma sempre Theme.of(context).colorScheme.* e AppSpacing.*.
import 'package:flutter/material.dart';

/// Colori di base. Material 3 genera l'intera palette (primary, secondary,
/// surface, error, ...) a partire da un solo "seed color".
abstract final class AppColors {
  /// Colore di brand da cui deriva tutto il ColorScheme.
  static const Color seed = Color(0xFF2563EB);

  /// Colori semantici non presenti nel ColorScheme standard (successo, avviso).
  /// L'errore usa invece colorScheme.error.
  static const Color success = Color(0xFF15803D);
  static const Color warning = Color(0xFFB45309);
}

/// Scala delle spaziature (multipli di 4, come raccomanda Material).
abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
}

/// Raggi degli angoli arrotondati.
abstract final class AppRadius {
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double pill = 999;
}

/// Breakpoint del layout responsive (larghezze in pixel logici).
abstract final class AppBreakpoints {
  /// Sotto questa larghezza la navigazione va in basso (NavigationBar),
  /// sopra diventa laterale (NavigationRail).
  static const double medium = 600;

  /// Larghezza massima del contenuto delle pagine su schermi grandi.
  static const double contentMaxWidth = 960;
}

/// Tipografia: famiglia del font e font monospazio per i blocchi di codice.
abstract final class AppTypography {
  /// null = font di sistema di Material (Roboto su Android/web, SF su iOS).
  /// Per un font custom: aggiungilo in pubspec.yaml (sezione fonts) e metti qui il nome.
  static const String? fontFamily = null;
  static const String monospace = 'monospace';
}

/// Costruisce i temi dell'app. `abstract final class` = classe non
/// istanziabile né estendibile: è solo un contenitore di membri statici.
abstract final class AppTheme {
  static ThemeData get light => _build(Brightness.light);
  static ThemeData get dark => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.seed,
      brightness: brightness,
      // fidelity: il primary resta vicino al colore di brand (il default
      // "tonalSpot" lo desatura molto).
      dynamicSchemeVariant: DynamicSchemeVariant.fidelity,
    );
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(AppRadius.md),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: AppTypography.fontFamily,
      // Sfondo a tinta unita (niente gradienti, vedi linee guida frontend).
      scaffoldBackgroundColor: colorScheme.surface,
      visualDensity: VisualDensity.standard,
      appBarTheme: AppBarTheme(
        centerTitle: false,
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        scrolledUnderElevation: 1,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: BorderSide(color: colorScheme.outlineVariant),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(shape: shape),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(shape: shape),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(shape: shape),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(shape: shape),
      ),
      snackBarTheme: const SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
      ),
      dialogTheme: DialogThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
    );
  }
}
