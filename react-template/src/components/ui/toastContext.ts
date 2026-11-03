// Contesto React dei toast. Un "contesto" permette a qualunque componente dell'albero
// di usare un valore condiviso (qui: la funzione per mostrare un toast) senza passarlo
// come prop a ogni livello. Il Provider e' in Toast.tsx; qui ci sono solo tipi e hook.
import { createContext, useContext } from 'react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Millisecondi prima della chiusura automatica (default 5000). */
  durationMs?: number;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Hook per mostrare un toast: `const { showToast } = useToast();` */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return context;
}
