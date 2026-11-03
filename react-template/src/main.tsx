// Punto di ingresso: monta React nel <div id="root"> di index.html. Nient'altro.
// StrictMode in sviluppo esegue alcuni controlli extra (es. effetti eseguiti due volte).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { env } from './config/env';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

// Titolo della scheda del browser preso da VITE_APP_TITLE.
document.title = env.appTitle;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
