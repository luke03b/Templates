// Definizione delle route dell'app (react-router, "data router").
// Ogni pagina e' caricata in modo LAZY: il suo codice viene scaricato solo la prima volta
// che l'utente la visita, cosi' il bundle iniziale resta piccolo.
// Per aggiungere una pagina: crea il file in src/pages e aggiungi un oggetto in `children`.
import type { RouteObject } from 'react-router';

import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/PageLoader';
import { RouteErrorPage } from '@/pages/RouteErrorPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppLayout,
    ErrorBoundary: RouteErrorPage,
    // Mostrato al primo avvio mentre si carica il codice della prima pagina.
    HydrateFallback: PageLoader,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/HomePage')).HomePage }),
      },
      {
        path: 'components',
        lazy: async () => ({ Component: (await import('@/pages/ComponentsPage')).ComponentsPage }),
      },
      {
        path: 'items',
        lazy: async () => ({ Component: (await import('@/pages/ItemsPage')).ItemsPage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
];
