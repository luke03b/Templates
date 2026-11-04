// Repository dello stato del backend. L'interfaccia astratta permette di
// sostituire l'implementazione HTTP con una finta nei test.
import '../api/api_client.dart';
import '../models/health_status.dart';

abstract interface class HealthRepository {
  /// Lancia ApiException se il backend non risponde o risponde con errore.
  Future<HealthStatus> check();
}

class HttpHealthRepository implements HealthRepository {
  HttpHealthRepository(this._client);

  final ApiClient _client;

  @override
  Future<HealthStatus> check() async {
    final json = await _client.get('/api/health');
    return HealthStatus.fromJson(json! as Map<String, dynamic>);
  }
}
