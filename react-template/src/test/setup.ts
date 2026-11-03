// Setup eseguito da Vitest prima di ogni file di test.
// - aggiunge i matcher di jest-dom (toBeInTheDocument, toHaveAttribute...);
// - completa jsdom con le API del browser che non implementa (es. <dialog>.showModal).
import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// jsdom non implementa HTMLDialogElement.showModal/close: polyfill minimo per i test.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
