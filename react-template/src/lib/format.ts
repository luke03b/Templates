// Funzioni pure di formattazione (numeri, date) riusabili in tutta l'app.
// Cambia LOCALE e CURRENCY per adattare l'app al tuo paese.

export const LOCALE = 'en-US';
export const CURRENCY = 'EUR';

const priceFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' });

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

/** Formatta una data ISO 8601; restituisce la stringa originale se non e' valida. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}
