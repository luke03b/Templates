// Indicatore di caricamento a tutta pagina (usato mentre si carica una route lazy).
import { Spinner } from './ui';

export function PageLoader() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}
