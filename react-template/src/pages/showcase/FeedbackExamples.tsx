// Esempi di feedback: Alert, Toast, Badge e Spinner.
import { useState } from 'react';

import { Alert, Badge, Button, Spinner, useToast, type ToastVariant } from '@/components/ui';

import styles from './Showcase.module.css';
import { ShowcaseSection } from './ShowcaseSection';

const ALERT_CODE = `
<Alert variant="info" title="Heads up">Informational message.</Alert>
<Alert variant="success" title="Saved">Your changes have been saved.</Alert>
<Alert variant="warning" title="Careful">This action affects all users.</Alert>
<Alert variant="danger" title="Error" onDismiss={() => setVisible(false)}>Something failed.</Alert>
`;

const TOAST_CODE = `
const { showToast } = useToast();
showToast({ title: 'Item saved', description: 'All good', variant: 'success' });
`;

const BADGE_CODE = `
<Badge>Neutral</Badge>
<Badge variant="success">Online</Badge>
<Spinner size="sm" />  <Spinner />  <Spinner size="lg" label="Loading data" />
`;

const TOAST_VARIANTS: ToastVariant[] = ['info', 'success', 'warning', 'danger'];

export function AlertExamples() {
  const [visible, setVisible] = useState(true);

  return (
    <ShowcaseSection id="alerts" title="Alerts" code={ALERT_CODE}>
      <div className={styles.stack}>
        <Alert variant="info" title="Heads up">
          Informational message.
        </Alert>
        <Alert variant="success" title="Saved">
          Your changes have been saved.
        </Alert>
        <Alert variant="warning" title="Careful">
          This action affects all users.
        </Alert>
        {visible ? (
          <Alert variant="danger" title="Error" onDismiss={() => setVisible(false)}>
            Something failed. Dismiss me.
          </Alert>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setVisible(true)}>
            Show the dismissed alert again
          </Button>
        )}
      </div>
    </ShowcaseSection>
  );
}

export function ToastExamples() {
  const { showToast } = useToast();

  return (
    <ShowcaseSection id="toasts" title="Toast notifications" code={TOAST_CODE}>
      {TOAST_VARIANTS.map((variant) => (
        <Button
          key={variant}
          variant="secondary"
          onClick={() =>
            showToast({
              title: `This is a ${variant} toast`,
              description: 'It closes by itself.',
              variant,
            })
          }
        >
          Show {variant}
        </Button>
      ))}
    </ShowcaseSection>
  );
}

export function BadgeAndSpinnerExamples() {
  return (
    <ShowcaseSection id="badges" title="Badges and spinners" code={BADGE_CODE}>
      <Badge>Neutral</Badge>
      <Badge variant="primary">New</Badge>
      <Badge variant="success">Online</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Failed</Badge>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" label="Loading data" />
    </ShowcaseSection>
  );
}
