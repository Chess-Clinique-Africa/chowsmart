import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="cs-footer">
      <span>ChowSmart by Products and Consumers Technologies Limited</span>
      <div>
        <a href="https://pctl-portfolio.chessclinique.chatgpt.site" target="_blank" rel="noreferrer">
          PCTL
        </a>
        <a
          href="https://www.linkedin.com/m/company/pctl-foods/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <Link to="/our-story">Story & survey</Link>
      </div>
    </footer>
  );
}
