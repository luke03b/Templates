// Helper puro per l'accessibilita' dei campi form: calcola il valore di aria-describedby
// (gli id di hint ed errore generati da FormField) per collegarli all'input.
// Sta in un file separato perche' i file .tsx dei componenti devono esportare solo componenti
// (requisito del Fast Refresh di Vite).

export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
