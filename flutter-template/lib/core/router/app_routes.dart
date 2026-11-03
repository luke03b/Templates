// Percorsi delle rotte in un unico punto: evita stringhe duplicate
// ("/items") sparse nel codice. Usa context.go(AppRoutes.items).
abstract final class AppRoutes {
  static const String home = '/';
  static const String components = '/components';
  static const String items = '/items';
}
