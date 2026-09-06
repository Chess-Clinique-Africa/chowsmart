import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="cs-footer">
      <Link to="/" className="cs-footer-brand" aria-label="ChowSmart home">
        <span className="chowsmart-identity">
          <img src="/chowsmart-mark-v2.png" alt="" width={40} height={40} />
          <span className="identity-type">
            <span className="identity-name">
              Chow<span>Smart</span>
            </span>
            <small>BY PCTL</small>
          </span>
        </span>
      </Link>

      <p className="cs-footer-tagline">
        ChowSmart by Products and Consumers Technologies Limited
      </p>

      <a
        className="cs-footer-about"
        href="https://pctl-portfolio.chessclinique.chatgpt.site"
        target="_blank"
        rel="noreferrer"
      >
        About PCTL
        <ArrowUpRight size={16} aria-hidden />
      </a>
    </footer>
  );
}
