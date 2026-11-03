// Helper di test: renderizza un componente/pagina con gli stessi provider dell'app
// (TanStack Query, Toast, router in memoria), cosi' i test somigliano all'uso reale.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

import { ToastProvider } from '@/components/ui';

interface Options {
  /** URL iniziale del router in memoria. */
  route?: string;
  /** Route personalizzate; di default l'elemento e' montato su "*". */
  routes?: RouteObject[];
}

export function renderWithProviders(ui: ReactElement, { route = '/', routes }: Options = {}) {
  // Un QueryClient nuovo per ogni test: niente cache condivisa tra test, niente retry.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(routes ?? [{ path: '*', element: ui }], {
    initialEntries: [route],
  });

  return {
    user: userEvent.setup(),
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>,
    ),
  };
}

/** Crea una Response JSON finta da restituire con fetch mockato. */
export function jsonResponse(
  body: unknown,
  status = 200,
  contentType = 'application/json',
): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } });
}
