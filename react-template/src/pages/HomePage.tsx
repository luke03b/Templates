// Home: breve presentazione del template e stato del backend.
import { Link } from 'react-router';

import { Card } from '@/components/ui';
import { BackendStatus } from '@/features/health/BackendStatus';

import styles from './HomePage.module.css';

const FEATURES = [
  {
    title: 'Components',
    description:
      'Accessible UI components written by hand, styled with CSS Modules and design tokens.',
    to: '/components',
  },
  {
    title: 'Items CRUD',
    description: 'A complete create/read/update/delete flow against /api/items with validation.',
    to: '/items',
  },
];

export function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <p className={styles.eyebrow}>React + Vite + TypeScript</p>
        <h1 id="home-title">A clean starting point for your next front end.</h1>
        <p className={styles.lead}>
          Routing, data fetching, forms with validation, a typed API client and a small component
          library: everything you need to start building features right away.
        </p>
      </section>

      <Card title="Backend status">
        <BackendStatus />
      </Card>

      <div className={styles.grid}>
        {FEATURES.map((feature) => (
          <Card key={feature.to} title={feature.title}>
            <p>{feature.description}</p>
            <Link to={feature.to}>Open {feature.title.toLowerCase()}</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
