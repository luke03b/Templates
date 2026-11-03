// Punto di ingresso: avvia l'app standalone con la configurazione definita in app.config.ts.
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((err: unknown) => console.error(err));
