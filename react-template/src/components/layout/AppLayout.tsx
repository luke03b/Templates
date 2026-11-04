// Layout comune a tutte le pagine: navbar in alto e contenuto della route corrente.
// <Outlet /> e' il "segnaposto" di react-router dove viene disegnata la pagina figlia.
import { Outlet, useNavigation } from 'react-router';

import styles from './AppLayout.module.css';
import { Navbar } from './Navbar';

export function AppLayout() {
  // Durante il caricamento di una route lazy mostriamo una sottile barra di avanzamento.
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading';

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <Navbar />
      {isNavigating && (
        <div className={styles.progress} role="progressbar" aria-label="Loading page" />
      )}
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
