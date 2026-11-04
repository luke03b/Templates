// Barra di navigazione responsive (mobile-first): su schermi stretti le voci sono in un
// menu a scomparsa aperto dal bottone "hamburger"; da tablet in su sono sempre visibili.
import { useState } from 'react';
import { NavLink } from 'react-router';

import { env } from '@/config/env';

import styles from './Navbar.module.css';
import { NAV_LINKS } from './navLinks';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main">
        <NavLink to="/" className={styles.brand} onClick={closeMenu}>
          {env.appTitle}
        </NavLink>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <span className={styles.bars} aria-hidden="true" />
        </button>
        <ul id="main-menu" className={`${styles.menu} ${menuOpen ? styles.open : ''}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              {/* NavLink aggiunge aria-current="page" alla voce della pagina corrente. */}
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
