// Voci del menu principale. Per aggiungere una pagina al menu basta aggiungere una riga qui.
export interface NavLinkItem {
  to: string;
  label: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Home' },
  { to: '/components', label: 'Components' },
  { to: '/items', label: 'Items' },
];
