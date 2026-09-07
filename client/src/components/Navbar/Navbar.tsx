import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ChefHat,
  Info,
  MapPin,
  Menu,
  Mic,
  Sparkles,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const links: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: '/restaurants', label: 'Restaurants', Icon: MapPin },
  { to: '/breads', label: 'Our breads', Icon: Wheat },
  { to: '/menu-studio', label: 'Menu studio', Icon: Sparkles },
  { to: '/recipe-lab', label: 'Recipe lab', Icon: ChefHat },
  { to: '/our-story', label: 'Our story', Icon: Info },
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
  const { pathname } = useLocation();
  const onMenuStudio = pathname.startsWith('/menu-studio');
  const ctaLabel = onMenuStudio ? 'Talk to ChowSmart' : 'Plan a menu';
  const CtaIcon = onMenuStudio ? Mic : Sparkles;

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
            <NavLink key={link.to} to={link.to} end={false}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-nav-actions">
          {onMenuStudio ? (
            <button
              type="button"
              className="app-quick-action"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('chowsmart:open-talk'));
              }}
            >
              <CtaIcon size={17} aria-hidden />
              {ctaLabel}
            </button>
          ) : (
            <Link to="/menu-studio" className="app-quick-action">
              <CtaIcon size={17} aria-hidden />
              {ctaLabel}
            </Link>
          )}
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
          <button
            type="button"
            className="app-menu-sheet-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />
          <div className="app-menu-sheet-panel">
            <button
              type="button"
              className="app-menu-sheet-close"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
            >
              <X size={18} strokeWidth={2.25} aria-hidden />
            </button>

            <div className="app-menu-sheet-intro">
              <h2>Explore ChowSmart</h2>
              <p>Discover food, build a menu, or develop a recipe.</p>
            </div>

            <nav className="app-menu-sheet-nav" aria-label="Explore">
              {links.map(({ to, label, Icon }) => (
                <NavLink key={to} to={to} onClick={() => setOpen(false)}>
                  <span className="app-menu-sheet-link-main">
                    <Icon size={22} strokeWidth={1.75} aria-hidden />
                    <span>{label}</span>
                  </span>
                  <ArrowUpRight size={18} strokeWidth={1.85} aria-hidden />
                </NavLink>
              ))}
            </nav>

            <div className="app-menu-sheet-account">
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setOpen(false)}>
                    Profile
                  </NavLink>
                  <NavLink to="/favorites" onClick={() => setOpen(false)}>
                    Favorites
                  </NavLink>
                  {isAdmin ? (
                    <NavLink to="/admin" onClick={() => setOpen(false)}>
                      Admin
                    </NavLink>
                  ) : null}
                  <button type="button" onClick={() => void handleLogout()}>
                    Log out
                  </button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setOpen(false)}>
                  Log in
                </NavLink>
              )}
            </div>

            <p className="app-menu-sheet-footer">Products and Consumers Technologies Limited</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
