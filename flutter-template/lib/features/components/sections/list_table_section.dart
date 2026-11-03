// Esempio: lista (ListTile) e tabella (DataTable) scorrevole in orizzontale
// su schermi stretti.
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../widgets/showcase_section.dart';

class ListTableSection extends StatelessWidget {
  const ListTableSection({super.key});

  static const _code = '''
ListTile(
  leading: const Icon(Icons.person),
  title: const Text('Ada Lovelace'),
  subtitle: const Text('Engineer'),
  trailing: const Icon(Icons.chevron_right),
  onTap: () {},
);

SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: DataTable(
    columns: const [DataColumn(label: Text('Name')), DataColumn(label: Text('Price'), numeric: true)],
    rows: const [DataRow(cells: [DataCell(Text('Keyboard')), DataCell(Text('49.90'))])],
  ),
);''';

  static const _people = [
    ('Ada Lovelace', 'Engineer'),
    ('Alan Turing', 'Mathematician'),
    ('Grace Hopper', 'Computer scientist'),
  ];

  static const _products = [
    ('Keyboard', 'Peripherals', 49.90),
    ('Monitor 27"', 'Displays', 229.00),
    ('USB-C cable', 'Accessories', 9.50),
  ];

  @override
  Widget build(BuildContext context) {
    return ShowcaseSection(
      title: 'Lists and tables',
      description: 'ListTile for lists, DataTable for tabular data.',
      code: _code,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final (name, role) in _people)
            ListTile(
              leading: const Icon(Icons.person_outline),
              title: Text(name),
              subtitle: Text(role),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
          const SizedBox(height: AppSpacing.md),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: const [
                DataColumn(label: Text('Product')),
                DataColumn(label: Text('Category')),
                DataColumn(label: Text('Price'), numeric: true),
              ],
              rows: [
                for (final (name, category, price) in _products)
                  DataRow(
                    cells: [
                      DataCell(Text(name)),
                      DataCell(Text(category)),
                      DataCell(Text('€ ${price.toStringAsFixed(2)}')),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
