// Dialog con il form di creazione/modifica di un item. Valida i campi lato
// client (Validators) e mostra sotto ogni campo gli errori restituiti dal
// backend in formato Problem Details (ApiException.fieldErrors).
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/api/api_exception.dart';
import '../../../data/models/item.dart';
import '../../../shared/validators/validators.dart';
import '../../../shared/widgets/app_alert.dart';
import '../../../shared/widgets/loading_button.dart';

/// Apre il dialog. [onSubmit] esegue il salvataggio e può lanciare
/// ApiException. Restituisce true se l'item è stato salvato.
Future<bool> showItemFormDialog(
  BuildContext context, {
  Item? item,
  required Future<void> Function(ItemInput input) onSubmit,
}) async {
  final saved = await showDialog<bool>(
    context: context,
    // Evita di chiudere il form per sbaglio toccando fuori.
    barrierDismissible: false,
    builder: (_) => ItemFormDialog(item: item, onSubmit: onSubmit),
  );
  return saved ?? false;
}

class ItemFormDialog extends StatefulWidget {
  const ItemFormDialog({super.key, this.item, required this.onSubmit});

  /// null = creazione, altrimenti modifica.
  final Item? item;
  final Future<void> Function(ItemInput input) onSubmit;

  @override
  State<ItemFormDialog> createState() => _ItemFormDialogState();
}

class _ItemFormDialogState extends State<ItemFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _description;
  late final TextEditingController _price;

  bool _submitting = false;
  Map<String, List<String>> _serverErrors = const {};
  String? _generalError;

  bool get _isEdit => widget.item != null;

  @override
  void initState() {
    super.initState();
    final item = widget.item;
    _name = TextEditingController(text: item?.name);
    _description = TextEditingController(text: item?.description);
    _price = TextEditingController(text: item?.price.toString());
  }

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _price.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _serverErrors = const {};
      _generalError = null;
    });
    if (!_formKey.currentState!.validate()) return;

    final input = ItemInput(
      name: _name.text,
      description: _description.text,
      price: Validators.parseNumber(_price.text)!,
    );

    setState(() => _submitting = true);
    try {
      await widget.onSubmit(input);
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _submitting = false;
        _serverErrors = e.fieldErrors;
        _generalError = e.message;
      });
    }
  }

  /// Toglie l'errore del server di un campo appena l'utente lo modifica.
  void _clearServerError(String field) {
    if (_serverErrors.containsKey(field)) {
      setState(() => _serverErrors = {..._serverErrors}..remove(field));
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(_isEdit ? 'Edit item' : 'New item'),
      content: SizedBox(
        width: 480,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (_generalError != null) ...[
                  AppAlert(
                    variant: AlertVariant.error,
                    message: _generalError!,
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],
                TextFormField(
                  key: const ValueKey('item-name'),
                  controller: _name,
                  autofocus: true,
                  decoration: const InputDecoration(labelText: 'Name *'),
                  maxLength: 100,
                  textInputAction: TextInputAction.next,
                  validator: Validators.compose([
                    Validators.required('name is required'),
                    Validators.maxLength(100),
                  ]),
                  // forceErrorText mostra l'errore del server anche se il
                  // validator locale è soddisfatto.
                  forceErrorText: _serverErrors['name']?.join('\n'),
                  onChanged: (_) => _clearServerError('name'),
                ),
                const SizedBox(height: AppSpacing.sm),
                TextFormField(
                  key: const ValueKey('item-description'),
                  controller: _description,
                  decoration: const InputDecoration(labelText: 'Description'),
                  minLines: 2,
                  maxLines: 4,
                  maxLength: 500,
                  validator: Validators.maxLength(500),
                  forceErrorText: _serverErrors['description']?.join('\n'),
                  onChanged: (_) => _clearServerError('description'),
                ),
                const SizedBox(height: AppSpacing.sm),
                TextFormField(
                  key: const ValueKey('item-price'),
                  controller: _price,
                  decoration: const InputDecoration(
                    labelText: 'Price *',
                    prefixText: '€ ',
                  ),
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  validator: Validators.compose([
                    Validators.required('price is required'),
                    Validators.number(),
                    Validators.min(0),
                  ]),
                  forceErrorText: _serverErrors['price']?.join('\n'),
                  onChanged: (_) => _clearServerError('price'),
                  onFieldSubmitted: (_) => _submit(),
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _submitting
              ? null
              : () => Navigator.of(context).pop(false),
          child: const Text('Cancel'),
        ),
        LoadingButton(
          label: _isEdit ? 'Save' : 'Create',
          isLoading: _submitting,
          onPressed: _submit,
        ),
      ],
    );
  }
}
