import { Link } from 'react-router-dom';

export default function OurStory() {
  return (
    <section className="shell section">
      <div className="section-head">
        <span className="eyebrow">Our story</span>
        <h2>ChowSmart by PCTL.</h2>
        <p>
          ChowSmart is a restaurant discovery and thoughtful-menu platform from Products and
          Consumers Technologies Limited — connecting Nigerian food culture with a curated
          bread collection and kitchen-ready planning tools.
        </p>
      </div>

      <div className="panel" style={{ maxWidth: 720 }}>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          From wheat baguettes to honey-, chocolate- and coconut-creamed loaves, the
          ChowSmart bread range is designed as a bridge between everyday baking and complete
          menus. Explore recipes, modelled nutrition, and pairings, then plan service with the
          menu studio or discover restaurants already leaning into the collection.
        </p>
        <div className="cta-row" style={{ marginTop: '1.5rem' }}>
          <Link className="btn btn-primary" to="/breads">
            See the breads
          </Link>
          <Link className="btn btn-ghost" to="/restaurants">
            Browse restaurants
          </Link>
        </div>
      </div>
    </section>
  );
}
