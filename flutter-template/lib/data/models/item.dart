// Modelli della risorsa "items": Item (letto dal server) e ItemInput (corpo
// inviato su POST/PUT). I nomi dei campi JSON sono quelli del contratto API.
import 'package:flutter/foundation.dart';

/// `@immutable`: tutti i campi sono final; per "modificare" si crea una copia.
@immutable
class Item {
  const Item({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Item.fromJson(Map<String, dynamic> json) => Item(
    id: json['id'] as String,
    name: json['name'] as String,
    description: json['description'] as String?,
    // `num` accetta sia 10 che 10.5; toDouble uniforma il tipo.
    price: (json['price'] as num).toDouble(),
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );

  final String id;
  final String name;
  final String? description;
  final double price;
  final DateTime createdAt;
  final DateTime updatedAt;

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'price': price,
    'createdAt': createdAt.toUtc().toIso8601String(),
    'updatedAt': updatedAt.toUtc().toIso8601String(),
  };

  @override
  bool operator ==(Object other) => other is Item && other.id == id;

  @override
  int get hashCode => id.hashCode;
}

/// Dati modificabili dall'utente (ItemInput del contratto).
@immutable
class ItemInput {
  const ItemInput({required this.name, this.description, required this.price});

  final String name;
  final String? description;
  final double price;

  /// Descrizione vuota inviata come null (campo opzionale).
  Map<String, dynamic> toJson() => {
    'name': name.trim(),
    'description': (description == null || description!.trim().isEmpty)
        ? null
        : description!.trim(),
    'price': price,
  };
}
