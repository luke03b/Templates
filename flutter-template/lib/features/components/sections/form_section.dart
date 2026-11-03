// Esempio: form con i campi principali (testo, email, select, textarea,
// checkbox, radio, switch) e validazione con i Validators condivisi.
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/validators/validators.dart';
import '../../../shared/widgets/app_snackbar.dart';
import '../widgets/showcase_section.dart';

enum ContactMethod { email, phone }

class FormSection extends StatelessWidget {
  const FormSection({super.key});

  static const _code = '''
final formKey = GlobalKey<FormState>();

Form(
  key: formKey,
  child: Column(children: [
    TextFormField(
      decoration: const InputDecoration(labelText: 'Name'),
      validator: Validators.compose([Validators.required(), Validators.maxLength(100)]),
    ),
    DropdownButtonFormField<String>(
      decoration: const InputDecoration(labelText: 'Role'),
      items: const [DropdownMenuItem(value: 'dev', child: Text('Developer'))],
      onChanged: (v) => role = v,
      validator: (v) => v == null ? 'Select a role' : null,
    ),
    RadioGroup<ContactMethod>(
      groupValue: method,
      onChanged: (v) => setState(() => method = v!),
      child: const Column(children: [
        RadioListTile(value: ContactMethod.email, title: Text('Email')),
        RadioListTile(value: ContactMethod.phone, title: Text('Phone')),
      ]),
    ),
    SwitchListTile(value: news, onChanged: (v) => setState(() => news = v), title: const Text('Newsletter')),
  ]),
);

if (formKey.currentState!.validate()) { /* invia */ }''';

  @override
  Widget build(BuildContext context) {
    return const ShowcaseSection(
      title: 'Form fields',
      description:
          'Text, email, select, textarea, checkbox, radio and switch with '
          'validation. Press "Submit" with empty fields to see the errors.',
      code: _code,
      child: DemoForm(),
    );
  }
}

/// Form dimostrativo, riutilizzabile come base per form reali.
class DemoForm extends StatefulWidget {
  const DemoForm({super.key});

  @override
  State<DemoForm> createState() => _DemoFormState();
}

class _DemoFormState extends State<DemoForm> {
  final _formKey = GlobalKey<FormState>();
  String? _role;
  ContactMethod _method = ContactMethod.email;
  bool _newsletter = false;

  void _submit() {
    if (_formKey.currentState!.validate()) {
      showAppSnackBar(context, 'Form is valid');
    }
  }

  void _reset() {
    _formKey.currentState!.reset();
    setState(() {
      _role = null;
      _method = ContactMethod.email;
      _newsletter = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    const gap = SizedBox(height: AppSpacing.md);
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            key: const ValueKey('demo-name'),
            decoration: const InputDecoration(labelText: 'Name *'),
            validator: Validators.compose([
              Validators.required(),
              Validators.maxLength(100),
            ]),
          ),
          gap,
          TextFormField(
            decoration: const InputDecoration(labelText: 'Email *'),
            keyboardType: TextInputType.emailAddress,
            validator: Validators.compose([
              Validators.required(),
              Validators.email(),
            ]),
          ),
          gap,
          DropdownButtonFormField<String>(
            initialValue: _role,
            decoration: const InputDecoration(labelText: 'Role *'),
            items: const [
              DropdownMenuItem(value: 'dev', child: Text('Developer')),
              DropdownMenuItem(value: 'design', child: Text('Designer')),
              DropdownMenuItem(value: 'pm', child: Text('Product manager')),
            ],
            onChanged: (value) => setState(() => _role = value),
            validator: (value) => value == null ? 'Select a role' : null,
          ),
          gap,
          TextFormField(
            decoration: const InputDecoration(
              labelText: 'Message',
              alignLabelWithHint: true,
            ),
            minLines: 3,
            maxLines: 5,
            maxLength: 500,
            validator: Validators.maxLength(500),
          ),
          Text('Contact method', style: Theme.of(context).textTheme.labelLarge),
          // RadioGroup gestisce il valore selezionato per tutti i Radio figli.
          RadioGroup<ContactMethod>(
            groupValue: _method,
            onChanged: (value) => setState(() => _method = value!),
            child: const Column(
              children: [
                RadioListTile(
                  value: ContactMethod.email,
                  title: Text('Email'),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile(
                  value: ContactMethod.phone,
                  title: Text('Phone'),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
          SwitchListTile(
            value: _newsletter,
            onChanged: (value) => setState(() => _newsletter = value),
            title: const Text('Subscribe to newsletter'),
            contentPadding: EdgeInsets.zero,
          ),
          // FormField generico: rende "validabile" anche una checkbox.
          FormField<bool>(
            initialValue: false,
            validator: (value) =>
                value == true ? null : 'You must accept the terms',
            builder: (field) => CheckboxListTile(
              value: field.value,
              onChanged: field.didChange,
              title: const Text('I accept the terms *'),
              subtitle: field.hasError
                  ? Text(
                      field.errorText!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    )
                  : null,
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
          ),
          gap,
          Wrap(
            spacing: AppSpacing.sm,
            children: [
              FilledButton(onPressed: _submit, child: const Text('Submit')),
              TextButton(onPressed: _reset, child: const Text('Reset')),
            ],
          ),
        ],
      ),
    );
  }
}
