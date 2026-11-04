// Configurazione dell'app letta a COMPILAZIONE tramite --dart-define.
// Flutter non legge variabili d'ambiente a runtime (l'app gira nel browser o
// sul telefono): i valori vengono "cotti" nel bundle quando si esegue
// `flutter run` / `flutter build` con --dart-define=CHIAVE=valore.
abstract final class AppConfig {
  /// URL base del backend, SENZA la parte /api e senza slash finale.
  ///
  /// - vuoto (default): chiamate relative (/api/...). È il caso del build web
  ///   servito da nginx in Docker, che fa da proxy di /api verso il backend.
  /// - sviluppo web: --dart-define=API_BASE_URL=http://localhost:3000
  /// - emulatore Android: --dart-define=API_BASE_URL=http://10.0.2.2:3000
  ///   (10.0.2.2 è l'alias dell'host visto dall'emulatore).
  ///
  /// `const String.fromEnvironment` funziona solo con `const`: il valore è
  /// noto al compilatore e non cambia mentre l'app gira.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  /// Timeout di ogni richiesta HTTP.
  static const Duration requestTimeout = Duration(seconds: 10);
}
