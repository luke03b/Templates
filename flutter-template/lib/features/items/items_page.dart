// Pagina Items: CRUD completo su /api/items. Gestisce gli stati di
// caricamento, errore (con Retry), lista vuota e lista popolata.
import 'package:flutter/material.dart';

import '../../core/di/app_scope.dart';
import '../../core/theme/app_theme.dart';
import '../../data/api/api_exception.dart';
import '../../data/models/item.dart';
import '../../shared/widgets/app_alert.dart';
import '../../shared/widgets/app_snackbar.dart';
import '../../shared/widgets/confirm_dialog.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/page_container.dart';
import 'items_controller.dart';
import 'widgets/item_form_dialog.dart';
import 'widgets/item_tile.dart';

class ItemsPage extends StatefulWidget {
  const ItemsPage({super.key});

  @override
  State<ItemsPage> createState() => _ItemsPageState();
}

class _ItemsPageState extends State<ItemsPage> {
  late final ItemsController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ItemsController(AppScope.of(context).itemsRepository)..load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _openForm([Item? item]) async {
    final saved = await showItemFormDialog(
      context,
      item: item,
      onSubmit: (input) => _controller.save(input, id: item?.id),
    );
    if (saved && mounted) {
      showAppSnackBar(context, item == null ? 'Item created' : 'Item updated');
    }
  }

  Future<void> _delete(Item item) async {
    final confirmed = await showConfirmDialog(
      context,
      title: 'Delete item?',
      message: '"${item.name}" will be permanently deleted.',
      confirmLabel: 'Delete',
      isDestructive: true,
    );
    if (!confirmed) return;
    try {
      await _controller.delete(item);
      if (mounted) showAppSnackBar(context, 'Item deleted');
    } on ApiException catch (e) {
      if (mounted) showAppSnackBar(context, e.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PageContainer(
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Items',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
            FilledButton.icon(
              onPressed: _openForm,
              icon: const Icon(Icons.add),
              label: const Text('New item'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        ListenableBuilder(
          listenable: _controller,
          builder: (context, _) => _buildContent(),
        ),
      ],
    );
  }

  Widget _buildContent() {
    final error = _controller.error;
    if (_controller.isLoading && _controller.items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.xl),
        child: Center(child: CircularProgressIndicator()),
      );
    }
    if (error != null) {
      return AppAlert(
        variant: AlertVariant.error,
        title: 'Could not load items',
        message: error.message,
        action: TextButton(
          onPressed: _controller.load,
          child: const Text('Retry'),
        ),
      );
    }
    if (_controller.items.isEmpty) {
      return EmptyState(
        icon: Icons.inventory_2_outlined,
        title: 'No items yet',
        message: 'Create the first one with the "New item" button.',
        action: OutlinedButton(
          onPressed: _controller.load,
          child: const Text('Reload'),
        ),
      );
    }
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (final (index, item) in _controller.items.indexed) ...[
            if (index > 0) const Divider(height: 1),
            ItemTile(
              key: ValueKey(item.id),
              item: item,
              onEdit: () => _openForm(item),
              onDelete: () => _delete(item),
            ),
          ],
        ],
      ),
    );
  }
}
