// Test dei componenti UI principali: accessibilita' e interazioni da tastiera/mouse.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button, Input, Modal, Switch, Tabs, ToastProvider, useToast } from '.';

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('calls onClick and defaults to type="button"', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'button');
  });
});

describe('Input', () => {
  it('links the label and announces the error', () => {
    render(<Input label="Email" error="Email is invalid" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Email is invalid');
  });
});

describe('Switch', () => {
  it('toggles with the keyboard', async () => {
    render(<Switch label="Dark mode" />);
    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    toggle.focus();
    await userEvent.keyboard(' ');
    expect(toggle).toBeChecked();
  });
});

describe('Tabs', () => {
  it('moves between tabs with the arrow keys', async () => {
    render(
      <Tabs
        label="Settings"
        items={[
          { id: 'a', label: 'First', content: 'First panel' },
          { id: 'b', label: 'Second', content: 'Second panel' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('tab', { name: 'First' }));
    await userEvent.keyboard('{ArrowRight}');

    const second = screen.getByRole('tab', { name: 'Second' });
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel');
  });
});

describe('Modal', () => {
  function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Modal open={open} title="Hello" onClose={() => setOpen(false)}>
          Body
        </Modal>
      </>
    );
  }

  it('opens and closes', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog', { name: 'Hello' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Toast', () => {
  function Trigger() {
    const { showToast } = useToast();
    return (
      <Button onClick={() => showToast({ title: 'Saved!', variant: 'success' })}>Notify</Button>
    );
  }

  it('shows a toast that can be dismissed', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByText('Saved!')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  });
});
