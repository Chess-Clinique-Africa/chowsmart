import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="cs-footer section-space">
      <div className="page-shell grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="cs-footer-brand" aria-label="ChowSmart home">
            <span className="chowsmart-identity">
              <img src="/chowsmart-mark-v2.png" alt="" width={40} height={40} />
              <span className="identity-type">
                <span className="identity-name">Chow<span>Smart</span></span>
                <small>BY PCTL</small>
              </span>
            </span>
          </Link>
          <p className="cs-footer-tagline">Bring a taste of every meal to your doorstep.</p>
        </div>
        <div><h2>Shop</h2><Link to="/restaurants">Restaurants</Link><Link to="/breads">Our breads</Link><Link to="/menu-studio">Menu studio</Link></div>
        <div><h2>Help</h2><Link to="/our-story">Our story</Link><Link to="/search">Search ChowSmart</Link><span>Returns within 3 days if unopened</span></div>
        <div><h2>Company</h2><a href="https://pctl-portfolio.chessclinique.chatgpt.site" target="_blank" rel="noreferrer">About PCTL <ArrowUpRight size={14} aria-hidden /></a><a href="mailto:hello@chowsmart.co"><Mail size={14} aria-hidden /> Contact us</a><span className="cs-footer-note">Thoughtful menus, wherever you are.</span></div>
      </div>
    </footer>
  );
}
