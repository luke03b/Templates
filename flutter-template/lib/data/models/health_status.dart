// Modello della risposta di GET /api/health (vedi docs/api-contract.md).
class HealthStatus {
  const HealthStatus({
    required this.status,
    required this.service,
    required this.timestamp,
  });

  /// `factory` = costruttore che può contenere logica e restituire un'istanza
  /// costruita altrove; qui converte la Map JSON in oggetto tipizzato.
  factory HealthStatus.fromJson(Map<String, dynamic> json) => HealthStatus(
    status: json['status'] as String,
    service: json['service'] as String? ?? 'unknown',
    timestamp: DateTime.parse(json['timestamp'] as String),
  );

  final String status;
  final String service;
  final DateTime timestamp;

  bool get isOk => status == 'ok';
}
