// Stato server della risorsa items, gestito con TanStack Query.
// - useQuery legge e mette in cache la lista;
// - useMutation esegue create/update/delete e poi "invalida" la cache, cosi' la lista
//   viene ricaricata automaticamente. Le pagine usano questi hook, mai itemsApi direttamente.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { itemsApi } from './itemsApi';
import type { ItemInput } from './itemTypes';

export const itemsQueryKey = ['items'] as const;

export function useItems() {
  return useQuery({
    queryKey: itemsQueryKey,
    queryFn: ({ signal }) => itemsApi.list(signal),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemInput) => itemsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsQueryKey }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ItemInput }) => itemsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsQueryKey }),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsQueryKey }),
  });
}
