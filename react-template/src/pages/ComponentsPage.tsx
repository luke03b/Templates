// Pagina Componenti: vetrina dei componenti UI con esempi dal vivo e codice da copiare.
// Ogni sezione e' un componente in ./showcase: per aggiungerne una, crea il file e mettilo in SECTIONS.
import { PageHeader } from '@/components/PageHeader';

import { ButtonExamples } from './showcase/ButtonExamples';
import { CardExample, TableExample, TabsExample } from './showcase/DataExamples';
import { AlertExamples, BadgeAndSpinnerExamples, ToastExamples } from './showcase/FeedbackExamples';
import { FormExample } from './showcase/FormExample';
import { NavigationExample } from './showcase/NavigationExample';
import { ModalExample } from './showcase/OverlayExamples';
import styles from './showcase/Showcase.module.css';
import { TypographyExample } from './showcase/TypographyExample';

const SECTIONS = [
  { id: 'typography', label: 'Typography', Component: TypographyExample },
  { id: 'buttons', label: 'Buttons', Component: ButtonExamples },
  { id: 'forms', label: 'Forms', Component: FormExample },
  { id: 'cards', label: 'Cards', Component: CardExample },
  { id: 'alerts', label: 'Alerts', Component: AlertExamples },
  { id: 'toasts', label: 'Toasts', Component: ToastExamples },
  { id: 'modal', label: 'Modal', Component: ModalExample },
  { id: 'tabs', label: 'Tabs', Component: TabsExample },
  { id: 'table', label: 'Table', Component: TableExample },
  { id: 'badges', label: 'Badges & spinners', Component: BadgeAndSpinnerExamples },
  { id: 'navigation', label: 'Navigation', Component: NavigationExample },
];

export function ComponentsPage() {
  return (
    <>
      <PageHeader
        title="Components"
        description="Reusable UI components from src/components/ui. Copy the snippets into your pages."
      />
      <nav aria-label="Components" style={{ marginBottom: 'var(--space-5)' }}>
        <ul className={styles.toc}>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.layout}>
        {SECTIONS.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </div>
    </>
  );
}
