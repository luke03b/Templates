// Validatori riutilizzabili per i TextFormField. Un validator Flutter è una
// funzione che riceve il valore e restituisce null (valido) oppure il
// messaggio di errore. Le regole rispecchiano quelle del backend
// (docs/api-contract.md) così l'utente vede l'errore prima di inviare.
typedef Validator = String? Function(String? value);

abstract final class Validators {
  static Validator required([String message = 'This field is required']) =>
      (value) => (value == null || value.trim().isEmpty) ? message : null;

  static Validator maxLength(int max) =>
      (value) => (value != null && value.trim().length > max)
      ? 'Must be at most $max characters'
      : null;

  /// Numero (accetta anche la virgola come separatore decimale).
  static Validator number() => (value) {
    if (value == null || value.trim().isEmpty) return null;
    return parseNumber(value) == null ? 'Must be a valid number' : null;
  };

  static Validator min(num min) => (value) {
    final number = value == null ? null : parseNumber(value);
    return (number != null && number < min)
        ? 'Must be greater than or equal to $min'
        : null;
  };

  static Validator email() => (value) {
    if (value == null || value.trim().isEmpty) return null;
    return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value.trim())
        ? null
        : 'Enter a valid email address';
  };

  /// Combina più validatori: restituisce il primo errore trovato.
  static Validator compose(List<Validator> validators) => (value) {
    for (final validator in validators) {
      final error = validator(value);
      if (error != null) return error;
    }
    return null;
  };

  /// "12,5" e "12.5" -> 12.5; testo non numerico -> null.
  static double? parseNumber(String value) =>
      double.tryParse(value.trim().replaceAll(',', '.'));
}
