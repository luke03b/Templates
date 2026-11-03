// Proxy del dev server (`ng serve`): inoltra le chiamate /api al backend, cosi' il frontend usa
// sempre URL relativi e non servono configurazioni CORS in sviluppo.
// Cambia backend senza toccare il codice:  API_PROXY_TARGET=http://localhost:8000 npm start
// Documentazione: https://angular.dev/tools/cli/serve#proxying-to-a-backend-server

const target = process.env.API_PROXY_TARGET || 'http://localhost:3000';

module.exports = {
  '/api': {
    target,
    // Riscrive l'header Host con quello del backend (utile con virtual host e servizi cloud).
    changeOrigin: true,
    // Accetta certificati self-signed se il target e' https.
    secure: false,
  },
};
