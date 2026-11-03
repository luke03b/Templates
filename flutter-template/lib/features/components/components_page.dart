// Pagina Componenti: vetrina dei widget Material principali, ognuno con
// anteprima live e codice copiabile. Ogni sezione è un widget separato in
// sections/, così si può copiare singolarmente in altri progetti.
import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../shared/widgets/page_container.dart';
import 'sections/badges_section.dart';
import 'sections/buttons_section.dart';
import 'sections/cards_section.dart';
import 'sections/feedback_section.dart';
import 'sections/form_section.dart';
import 'sections/list_table_section.dart';
import 'sections/loading_section.dart';
import 'sections/navigation_section.dart';
import 'sections/tabs_section.dart';
import 'sections/typography_section.dart';

class ComponentsPage extends StatelessWidget {
  const ComponentsPage({super.key});

  static const _sections = <Widget>[
    TypographySection(),
    ButtonsSection(),
    FormSection(),
    CardsSection(),
    FeedbackSection(),
    TabsSection(),
    ListTableSection(),
    BadgesSection(),
    LoadingSection(),
    NavigationSection(),
  ];

  @override
  Widget build(BuildContext context) {
    return PageContainer(
      children: [
        Text('Components', style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: AppSpacing.xs),
        const Text(
          'Material 3 widgets themed by lib/core/theme/app_theme.dart.',
        ),
        for (final section in _sections) ...[
          const SizedBox(height: AppSpacing.md),
          section,
        ],
      ],
    );
  }
}
