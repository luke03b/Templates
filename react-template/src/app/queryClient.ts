// Crea il QueryClient di TanStack Query: la cache condivisa di tutti i dati letti dal backend.
import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/httpClient';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // per 30s i dati sono "freschi" e non vengono riscaricati
        refetchOnWindowFocus: false,
        // Riprova una volta solo su errori di rete/5xx: un 404 o 400 non migliora riprovando.
        retry: (failureCount, error) =>
          failureCount < 1 &&
          !(error instanceof ApiError && error.status >= 400 && error.status < 500),
      },
    },
  });
}
