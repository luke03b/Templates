// Punto di ingresso: solo bootstrap (URL strategy, dipendenze, root widget).
// Nessuna logica applicativa qui.
import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/url_strategy.dart';

import 'app.dart';
import 'data/api/api_client.dart';
import 'data/repositories/health_repository.dart';
import 'data/repositories/items_repository.dart';

void main() {
  // Web: URL senza '#' (/items invece di /#/items). nginx fa il fallback
  // su index.html. Su Android/iOS non ha effetto.
  usePathUrlStrategy();

  // Un solo ApiClient condiviso da tutti i repository.
  final apiClient = ApiClient();

  runApp(
    App(
      healthRepository: HttpHealthRepository(apiClient),
      itemsRepository: HttpItemsRepository(apiClient),
    ),
  );
}
