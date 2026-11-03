// Stato della pagina Home: interroga GET /api/health e espone lo stato del
// backend. ChangeNotifier è il meccanismo nativo di Flutter per lo stato
// osservabile: chi lo ascolta (ListenableBuilder) si ricostruisce a ogni
// notifyListeners().
import 'package:flutter/foundation.dart';

import '../../data/models/health_status.dart';
import '../../data/repositories/health_repository.dart';
import '../../shared/widgets/status_indicator.dart';

class BackendStatusController extends ChangeNotifier {
  BackendStatusController(this._repository);

  final HealthRepository _repository;

  ServiceStatus _status = ServiceStatus.checking;
  HealthStatus? _health;
  String? _error;
  bool _disposed = false;

  ServiceStatus get status => _status;
  HealthStatus? get health => _health;
  String? get error => _error;

  Future<void> check() async {
    _status = ServiceStatus.checking;
    _notify();
    try {
      final health = await _repository.check();
      _health = health;
      _error = null;
      _status = health.isOk ? ServiceStatus.online : ServiceStatus.offline;
    } on Exception catch (e) {
      // Qualsiasi errore (rete, 5xx, JSON inatteso) = backend non disponibile.
      _health = null;
      _error = e.toString();
      _status = ServiceStatus.offline;
    }
    _notify();
  }

  /// Evita notifyListeners dopo dispose (la richiesta può finire dopo che
  /// l'utente ha cambiato pagina).
  void _notify() {
    if (!_disposed) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
