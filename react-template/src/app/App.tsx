// Componente radice: monta i provider globali (cache dati, toast) e il router.
// I "provider" sono componenti che rendono disponibile un valore a tutto l'albero sottostante.
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { ToastProvider } from '@/components/ui';

import { createQueryClient } from './queryClient';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export function App() {
  // useState con funzione: il QueryClient viene creato una sola volta, non a ogni render.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}
