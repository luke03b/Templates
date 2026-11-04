// Stato della pagina Items: lista, caricamento ed errori. La pagina chiama
// il controller, il controller chiama il repository: la UI non conosce HTTP.
import 'package:flutter/foundation.dart';

import '../../data/api/api_exception.dart';
import '../../data/models/item.dart';
import '../../data/repositories/items_repository.dart';

class ItemsController extends ChangeNotifier {
  ItemsController(this._repository);

  final ItemsRepository _repository;

  List<Item> _items = const [];
  bool _isLoading = false;
  ApiException? _error;
  bool _disposed = false;

  List<Item> get items => _items;
  bool get isLoading => _isLoading;

  /// Errore dell'ultimo caricamento della lista (null se ok).
  ApiException? get error => _error;

  Future<void> load() async {
    _isLoading = true;
    _error = null;
    _notify();
    try {
      _items = await _repository.list();
    } on ApiException catch (e) {
      _error = e;
    } finally {
      _isLoading = false;
      _notify();
    }
  }

  /// Crea (id null) o aggiorna un item. Rilancia ApiException così il form
  /// può mostrare gli errori di validazione sui singoli campi.
  Future<Item> save(ItemInput input, {String? id}) async {
    final saved = id == null
        ? await _repository.create(input)
        : await _repository.update(id, input);
    _items = id == null
        ? [..._items, saved]
        : [
            for (final item in _items)
              if (item.id == id) saved else item,
          ];
    _notify();
    return saved;
  }

  /// Elimina un item. Un 404 significa che è già stato eliminato altrove:
  /// lo togliamo comunque dalla lista e non lo consideriamo un errore.
  Future<void> delete(Item item) async {
    try {
      await _repository.delete(item.id);
    } on ApiException catch (e) {
      if (!e.isNotFound) rethrow;
    }
    _items = _items.where((i) => i.id != item.id).toList();
    _notify();
  }

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
