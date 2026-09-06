import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ChefHat,
  MapPin,
  Menu,
  Sparkles,
  Wheat,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const links = [
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/breads', label: 'Our breads' },
  { to: '/menu-studio', label: 'Menu studio' },
  { to: '/recipe-lab', label: 'Recipe lab' },
  { to: '/our-story', label: 'Our story' },
];

const dockLinks = [
  { to: '/restaurants', label: 'Restaurants', Icon: MapPin },
  { to: '/breads', label: 'Our breads', Icon: Wheat },
  { to: '/menu-studio', label: 'Menu studio', Icon: Sparkles },
  { to: '/recipe-lab', label: 'Recipe lab', Icon: ChefHat },
];

function BrandMark() {
  return (
    <span className="chowsmart-identity">
      <img src="/chowsmart-mark-v2.png" alt="" width={48} height={48} />
      <span className="identity-type">
        <span className="identity-name">
          Chow<span>Smart</span>
        </span>
        <small>BY PCTL</small>
      </span>
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <>
      <header className="app-navigation">
        <Link to="/" aria-label="ChowSmart home" className="app-home" onClick={() => setOpen(false)}>
          <BrandMark />
        </Link>

        <nav className="app-desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-nav-actions">
          {user ? (
            <>
              <Link to="/profile" style={{ fontSize: 13, fontWeight: 600, color: '#63796d' }}>
                {user.name.split(' ')[0]}
              </Link>
              {isAdmin ? (
                <Link to="/admin" style={{ fontSize: 13, fontWeight: 600, color: '#63796d' }}>
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void handleLogout()}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#63796d',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </>
          ) : null}
          <Link to="/menu-studio" className="app-quick-action">
            <Sparkles size={17} aria-hidden />
            Plan a menu
          </Link>
          <button
            type="button"
            className="app-mobile-menu"
            aria-label="Open navigation menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={23} aria-hidden />
          </button>
        </div>
      </header>

      <nav className="app-mobile-dock" aria-label="Quick navigation">
        {dockLinks.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}>
            <Icon size={21} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {open ? (
        <div className="app-menu-sheet" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="app-menu-sheet-panel">
            <button
              type="button"
              className="app-menu-sheet-close"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/menu-studio"
              className="app-quick-action"
              style={{ marginTop: 12 }}
              onClick={() => setOpen(false)}
            >
              <Sparkles size={17} aria-hidden />
              Plan a menu
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
