import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import BreadCard from '../components/BreadCard';

export default function Home() {
  const [breads, setBreads] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .breads()
      .then(setBreads)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <section className="shell hero">
        <div className="hero-copy">
          <span className="eyebrow">The ChowSmart bread collection</span>
          <h1>
            Choose your <em>ChowSmart bread.</em>
          </h1>
          <p className="hero-lead">
            Select a bread to explore its recipe, nutrition and pairings — then build a
            complete menu around Nigerian dishes and worldwide cuisines.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/breads">
              Explore all five
            </Link>
            <Link className="btn btn-ghost" to="/menu-studio">
              Open menu studio
            </Link>
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="section-head">
          <span className="eyebrow">Swipe on smaller screens</span>
          <h2>Five loaves. One collection.</h2>
          <p>
            AI-refined concept images based on the reference sheets. Illustrations of the
            proposed range, not photographs of manufactured products.
          </p>
        </div>

        {error && <p className="status error">{error}</p>}
        {!error && breads.length === 0 && <p className="status">Loading breads…</p>}

        <div className="bread-track">
          {breads.map((bread) => (
            <BreadCard key={bread.id} bread={bread} />
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="section-head">
          <span className="eyebrow">Next steps</span>
          <h2>From a bread to a complete menu.</h2>
          <p>
            Keep exploring Nigerian dishes, worldwide cuisines and voice-assisted menu
            planning.
          </p>
        </div>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/restaurants">
            Find a restaurant
          </Link>
          <Link className="btn btn-ghost" to="/menu-studio">
            Open AI menu studio
          </Link>
        </div>
      </section>
    </>
  );
}
