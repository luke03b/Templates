// Riga della lista items con prezzo e azioni modifica/elimina.
import 'package:flutter/material.dart';

import '../../../data/models/item.dart';

class ItemTile extends StatelessWidget {
  const ItemTile({
    super.key,
    required this.item,
    required this.onEdit,
    required this.onDelete,
  });

  final Item item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final description = item.description;
    return ListTile(
      title: Text(item.name),
      subtitle: description == null || description.isEmpty
          ? null
          : Text(description, maxLines: 2, overflow: TextOverflow.ellipsis),
      leading: CircleAvatar(
        child: Text(item.name.isEmpty ? '?' : item.name[0].toUpperCase()),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '€ ${item.price.toStringAsFixed(2)}',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          IconButton(
            tooltip: 'Edit',
            icon: const Icon(Icons.edit_outlined),
            onPressed: onEdit,
          ),
          IconButton(
            tooltip: 'Delete',
            icon: const Icon(Icons.delete_outline),
            onPressed: onDelete,
          ),
        ],
      ),
      onTap: onEdit,
    );
  }
}
