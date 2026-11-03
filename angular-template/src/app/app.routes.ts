// Tabella delle rotte. Ogni pagina e' caricata in "lazy loading": il suo codice viene scaricato
// solo quando l'utente la visita (bundle iniziale piu' piccolo).
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Home · Angular Template',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'components',
    title: 'Components · Angular Template',
    loadComponent: () => import('./features/showcase/showcase-page').then((m) => m.ShowcasePage),
  },
  {
    // Una feature con piu' pagine porta con se' le sue rotte figlie (items.routes.ts).
    path: 'items',
    loadChildren: () => import('./features/items/items.routes').then((m) => m.ITEMS_ROUTES),
  },
  {
    // "**" intercetta qualsiasi URL non riconosciuto: deve restare l'ULTIMA rotta.
    path: '**',
    title: 'Page not found · Angular Template',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
