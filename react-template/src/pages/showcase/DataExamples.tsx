// Esempi di visualizzazione dati: Card, Tabs e Table.
import { Badge, Button, Card, Table, Tabs, type TableColumn } from '@/components/ui';

import styles from './Showcase.module.css';
import { ShowcaseSection } from './ShowcaseSection';

const CARD_CODE = `
<Card title="Card title" actions={<Button size="sm">Action</Button>} footer="Footer text">
  <p>Card content.</p>
</Card>
`;

const TABS_CODE = `
<Tabs
  label="Account settings"
  items={[
    { id: 'profile', label: 'Profile', content: <p>Profile settings</p> },
    { id: 'security', label: 'Security', content: <p>Security settings</p> },
  ]}
/>
`;

const TABLE_CODE = `
const columns: TableColumn<User>[] = [
  { key: 'name', header: 'Name', render: (u) => u.name },
  { key: 'role', header: 'Role', render: (u) => <Badge>{u.role}</Badge> },
];

<Table caption="Users" columns={columns} rows={users} getRowKey={(u) => u.id} />
`;

interface DemoUser {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

const USERS: DemoUser[] = [
  { id: '1', name: 'Ada Lovelace', role: 'Admin', active: true },
  { id: '2', name: 'Alan Turing', role: 'Editor', active: true },
  { id: '3', name: 'Grace Hopper', role: 'Viewer', active: false },
];

const USER_COLUMNS: TableColumn<DemoUser>[] = [
  { key: 'name', header: 'Name', render: (user) => user.name },
  { key: 'role', header: 'Role', render: (user) => <Badge variant="primary">{user.role}</Badge> },
  {
    key: 'status',
    header: 'Status',
    render: (user) => (
      <Badge variant={user.active ? 'success' : 'neutral'}>
        {user.active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
];

export function CardExample() {
  return (
    <ShowcaseSection id="cards" title="Cards" code={CARD_CODE}>
      <div className={styles.formGrid}>
        <Card title="Card title" actions={<Button size="sm">Action</Button>} footer="Footer text">
          <p>Cards group related content and actions.</p>
        </Card>
        <Card>
          <p>A card without a header is just a bordered surface.</p>
        </Card>
      </div>
    </ShowcaseSection>
  );
}

export function TabsExample() {
  return (
    <ShowcaseSection
      id="tabs"
      title="Tabs"
      description="Use the arrow keys, Home and End to move between tabs."
      code={TABS_CODE}
    >
      <div className={styles.stack}>
        <Tabs
          label="Account settings"
          items={[
            { id: 'profile', label: 'Profile', content: <p>Profile settings go here.</p> },
            {
              id: 'security',
              label: 'Security',
              content: <p>Password and two-factor authentication.</p>,
            },
            { id: 'billing', label: 'Billing', content: <p>Invoices and payment methods.</p> },
          ]}
        />
      </div>
    </ShowcaseSection>
  );
}

export function TableExample() {
  return (
    <ShowcaseSection id="table" title="Table" code={TABLE_CODE}>
      <div className={styles.stack}>
        <Table
          caption="Demo users"
          captionVisible
          columns={USER_COLUMNS}
          rows={USERS}
          getRowKey={(u) => u.id}
        />
      </div>
    </ShowcaseSection>
  );
}
