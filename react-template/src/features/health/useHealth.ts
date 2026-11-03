// Hook che interroga periodicamente lo stato del backend.
// useQuery (TanStack Query) gestisce per noi cache, loading, errori e polling:
// il componente riceve solo { data, isPending, isError } e si limita a disegnarli.

import { useQuery } from '@tanstack/react-query';

import { healthApi } from './healthApi';

export const healthQueryKey = ['health'] as const;

export function useHealth() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: ({ signal }) => healthApi.get(signal),
    refetchInterval: 15_000, // ricontrolla ogni 15 secondi
    retry: false, // se il backend e' giu' vogliamo vederlo subito "Offline"
  });
}
