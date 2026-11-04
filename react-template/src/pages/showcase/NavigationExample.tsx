// Esempio: navigazione con react-router (Link, NavLink e navigazione da codice).
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui';

import { ShowcaseSection } from './ShowcaseSection';

const CODE = `
import { Link, NavLink, useNavigate } from 'react-router';

<Link to="/items">Go to items</Link>
<NavLink to="/items" className={({ isActive }) => (isActive ? 'active' : '')}>Items</NavLink>

const navigate = useNavigate();
<Button onClick={() => navigate('/')}>Back home</Button>
`;

export function NavigationExample() {
  const navigate = useNavigate();

  return (
    <ShowcaseSection
      id="navigation"
      title="Navigation"
      description="The responsive navbar at the top is built with NavLink; here are the building blocks."
      code={CODE}
    >
      <Link to="/items">Go to items</Link>
      <Link to="/this-page-does-not-exist">Open a missing page (404)</Link>
      <Button variant="secondary" onClick={() => void navigate('/')}>
        Back home
      </Button>
    </ShowcaseSection>
  );
}
