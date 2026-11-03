// Configurazione globale dell'applicazione: elenco dei "provider" registrati nel DI root.
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconRegistry } from '@angular/material/icon';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { errorInterceptor } from './core/http/error-interceptor';

// Note su Angular 22:
// - l'app e' "zoneless" di default (niente zone.js): il rendering si aggiorna tramite signal,
//   eventi del template e AsyncPipe; non serve provideZonelessChangeDetection().
// - i componenti sono OnPush di default.
// - HttpClient usa gia' l'API fetch del browser (withFetch() e' deprecato e non serve).
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Passa parametri di rotta (es. :id) direttamente agli input() del componente.
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withViewTransitions(),
    ),
    provideHttpClient(withInterceptors([errorInterceptor])),
    // Usa il font "Material Symbols Outlined" (caricato in index.html) per <mat-icon>.
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),
    // Stile di default di tutti i <mat-form-field>.
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
  ],
};
