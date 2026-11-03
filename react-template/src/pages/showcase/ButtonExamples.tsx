// Esempio: varianti, dimensioni, disabled e loading del Button.
import { useState } from 'react';

import { Button } from '@/components/ui';

import { ShowcaseSection } from './ShowcaseSection';

const CODE = `
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button size="sm">Small</Button>
<Button disabled>Disabled</Button>
<Button loading={isSaving} onClick={save}>Save</Button>
`;

export function ButtonExamples() {
  const [loading, setLoading] = useState(false);

  const simulateSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <ShowcaseSection id="buttons" title="Buttons" code={CODE}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button size="sm">Small</Button>
      <Button disabled>Disabled</Button>
      <Button loading={loading} onClick={simulateSave}>
        {loading ? 'Saving…' : 'Click to load'}
      </Button>
    </ShowcaseSection>
  );
}
