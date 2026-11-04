// Configurazione del client API: URL base usato da ApiClient per tutte le chiamate HTTP.
import { InjectionToken } from '@angular/core';

/**
 * Un InjectionToken e' una "chiave" per la dependency injection di Angular quando il valore
 * da iniettare non e' una classe (qui una stringa).
 *
 * Default: percorso RELATIVO `/api`, come da contratto API comune.
 * - in sviluppo il dev server lo inoltra al backend tramite `proxy.conf.js`;
 * - in Docker lo inoltra nginx (variabile API_UPSTREAM).
 *
 * Per puntare a un backend assoluto (es. senza proxy) basta sovrascriverlo in app.config.ts:
 * `{ provide: API_BASE_URL, useValue: 'https://api.example.com/api' }`.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
