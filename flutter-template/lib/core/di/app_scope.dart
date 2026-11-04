// Dependency injection minimale basata su InheritedWidget (meccanismo nativo
// di Flutter per rendere disponibile un oggetto a tutto il sottoalbero dei
// widget). Le pagine recuperano i repository con AppScope.of(context), così
// nei test si possono iniettare implementazioni finte senza toccare le pagine.
import 'package:flutter/widgets.dart';

import '../../data/repositories/health_repository.dart';
import '../../data/repositories/items_repository.dart';

class AppScope extends InheritedWidget {
  const AppScope({
    super.key,
    required this.healthRepository,
    required this.itemsRepository,
    required super.child,
  });

  final HealthRepository healthRepository;
  final ItemsRepository itemsRepository;

  /// Restituisce l'AppScope più vicino. Usa `getInheritedWidgetOfExactType`
  /// (non registra una dipendenza), quindi è chiamabile anche da initState.
  static AppScope of(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, 'AppScope not found in the widget tree');
    return scope!;
  }

  // Le dipendenze non cambiano durante la vita dell'app: nessun rebuild.
  @override
  bool updateShouldNotify(AppScope oldWidget) =>
      healthRepository != oldWidget.healthRepository ||
      itemsRepository != oldWidget.itemsRepository;
}
