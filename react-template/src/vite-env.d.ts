// Tipi delle variabili d'ambiente VITE_ lette tramite import.meta.env.
// Aggiungi qui ogni nuova variabile per avere autocompletamento e controllo dei tipi.
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
