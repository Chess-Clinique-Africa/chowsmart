import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';

const links = [
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/breads', label: 'Our breads' },
  { to: '/menu-studio', label: 'Menu studio' },
  { to: '/recipe-lab', label: 'Recipe lab' },
  { to: '/our-story', label: 'Our story' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell nav">
          <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-name">ChowSmart</span>
            <span className="brand-by">By PCTL</span>
          </NavLink>

          <nav className="nav-links" aria-label="Primary">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <NavLink className="nav-cta" to="/menu-studio">
            Plan a menu
          </NavLink>

          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>

        <nav
          id="mobile-nav"
          className={`shell mobile-nav${open ? ' open' : ''}`}
          aria-label="Mobile"
        >
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <strong>ChowSmart</strong>
            <div>By Products and Consumers Technologies Limited</div>
          </div>
          <div>Restaurant discovery & thoughtful menus</div>
        </div>
      </footer>
    </>
  );
}
