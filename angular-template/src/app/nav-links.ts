// Voci del menu principale: aggiungi qui una riga per mostrare una nuova pagina nella navbar.
export interface NavLink {
  path: string;
  label: string;
  icon: string;
  /** true = attivo solo sul percorso esatto (serve per la Home "/"). */
  exact: boolean;
}

export const NAV_LINKS: readonly NavLink[] = [
  { path: '/', label: 'Home', icon: 'home', exact: true },
  { path: '/components', label: 'Components', icon: 'widgets', exact: false },
  { path: '/items', label: 'Items', icon: 'inventory_2', exact: false },
];
