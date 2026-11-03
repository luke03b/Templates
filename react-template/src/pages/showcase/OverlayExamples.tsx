// Esempio: Modal di conferma controllato da uno stato booleano.
import { useState } from 'react';

import { Button, Modal, useToast } from '@/components/ui';

import { ShowcaseSection } from './ShowcaseSection';

const CODE = `
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open modal</Button>
<Modal
  open={open}
  title="Confirm action"
  onClose={() => setOpen(false)}
  footer={<Button onClick={confirm}>Confirm</Button>}
>
  <p>Modal content goes here.</p>
</Modal>
`;

export function ModalExample() {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  const confirm = () => {
    setOpen(false);
    showToast({ title: 'Confirmed', variant: 'success' });
  };

  return (
    <ShowcaseSection
      id="modal"
      title="Modal dialog"
      description="Focus stays inside the dialog; press Esc to close."
      code={CODE}
    >
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        title="Confirm action"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirm}>Confirm</Button>
          </>
        }
      >
        <p>This is a native &lt;dialog&gt; opened with showModal().</p>
      </Modal>
    </ShowcaseSection>
  );
}
