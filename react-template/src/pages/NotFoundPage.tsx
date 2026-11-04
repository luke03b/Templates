// Pagina 404: qualunque URL non riconosciuto dal router arriva qui (route path="*").
import { Link } from 'react-router';

import { Card } from '@/components/ui';

import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.wrapper}>
      <Card>
        <p className={styles.code}>404</p>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link to="/">Back to home</Link>
      </Card>
    </div>
  );
}
