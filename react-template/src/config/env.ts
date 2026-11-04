// Unico punto in cui si leggono le variabili d'ambiente del frontend.
// Il resto del codice importa `env` invece di usare import.meta.env direttamente,
// cosi' i default sono in un solo posto e i test possono sostituirli facilmente.

export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE ?? 'React Template',
  // Percorso relativo: in dev lo gira il proxy di Vite, in Docker il reverse proxy di nginx.
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, ''),
} as const;
