// Pagina mostrata da react-router se una route lancia un errore (es. chunk lazy non scaricabile).
// Non mostra dettagli tecnici all'utente: li scrive solo nella console.
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { Alert } from '@/components/ui';

export function RouteErrorPage() {
  const error = useRouteError();
  console.error(error);

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong while loading this page.';

  return (
    <main style={{ maxWidth: '40rem', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <Alert variant="danger" title="Unexpected error">
        <p>{message}</p>
        <Link to="/">Back to home</Link>
      </Alert>
    </main>
  );
}
