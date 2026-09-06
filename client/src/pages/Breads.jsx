import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import BreadCard from '../components/BreadCard';

export default function Breads() {
  const [breads, setBreads] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .breads()
      .then(setBreads)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="shell section">
      <div className="section-head">
        <span className="eyebrow">Our breads</span>
        <h2>The ChowSmart bread collection</h2>
        <p>Select a bread to explore its recipe, nutrition and pairings.</p>
      </div>
      {error && <p className="status error">{error}</p>}
      <div className="bread-track">
        {breads.map((bread) => (
          <BreadCard key={bread.id} bread={bread} />
        ))}
      </div>
      <p className="note">
        Prefer a guided flow?{' '}
        <Link to="/menu-studio">Plan a menu</Link> around your favourite loaf.
      </p>
    </section>
  );
}

export function BreadDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [bread, setBread] = useState(null);
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState('recipe');
  const [error, setError] = useState('');

  useEffect(() => {
    setTab('recipe');
    setError('');
    Promise.all([api.bread(slug), api.breads()])
      .then(([detail, list]) => {
        setBread(detail);
        setAll(list);
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) return <p className="shell status error">{error}</p>;
  if (!bread) return <p className="shell status">Loading bread…</p>;

  return (
    <section className="shell detail-layout">
      <div>
        <div className="detail-hero">
          <span className="eyebrow">{bread.eyebrow}</span>
          <h1>ChowSmart {bread.name}</h1>
          <p>{bread.tagline}</p>
          <div className="pill-row">
            <span className="pill">
              <strong>Allergens</strong>
              {bread.allergens?.join(', ')}
            </span>
            <span className="pill">
              <strong>Prep</strong>
              about {bread.prep_minutes} minutes
            </span>
            <span className="pill">
              <strong>Portions</strong>
              {bread.portion_note}
            </span>
          </div>
          <div className="chip-nav">
            {all.map((b) => (
              <button
                key={b.slug}
                type="button"
                className={`chip${b.slug === bread.slug ? ' active' : ''}`}
                onClick={() => navigate(`/breads/${b.slug}`)}
              >
                {b.short_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="tabs" role="tablist">
          {['recipe', 'nutrition', 'pairings', 'reference'].map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              className={`tab${tab === t ? ' active' : ''}`}
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'recipe' && (
          <div className="panel">
            <h3>Recipe</h3>
            <p className="note" style={{ marginTop: 0 }}>
              Recipe portions · {bread.portion_note}
            </p>
            <ul className="ingredient-list">
              {bread.ingredients.map((ing) => (
                <li key={ing.name}>
                  <span>{ing.name}</span>
                  <strong>{Number(ing.amount_g).toFixed(1)} g</strong>
                </li>
              ))}
            </ul>
            <h3 style={{ marginTop: '1.5rem' }}>
              Preparation method · about {bread.prep_minutes} minutes
            </h3>
            <ol className="step-list">
              {bread.steps.map((step) => (
                <li key={step.step_number}>
                  <span className="n">{step.step_number}</span>
                  <span>{step.instruction}</span>
                </li>
              ))}
            </ol>
            <p className="note">
              Development recipe: the filling, ingredient weights and baked yield still need
              kitchen validation. The reference image alone cannot establish a formula.
            </p>
          </div>
        )}

        {tab === 'nutrition' && bread.nutrition && (
          <div className="panel">
            <h3>Nutrition</h3>
            <p className="note" style={{ marginTop: 0 }}>
              {bread.nutrition.per_note}
            </p>
            <div className="nutrition-grid">
              <div className="stat">
                <span>Energy</span>
                <strong>{bread.nutrition.energy_kcal} kcal</strong>
              </div>
              <div className="stat">
                <span>Protein</span>
                <strong>{bread.nutrition.protein_g} g</strong>
              </div>
              <div className="stat">
                <span>Carbs</span>
                <strong>{bread.nutrition.carbs_g} g</strong>
              </div>
              <div className="stat">
                <span>Fat</span>
                <strong>{bread.nutrition.fat_g} g</strong>
              </div>
              <div className="stat">
                <span>Fibre</span>
                <strong>{bread.nutrition.fibre_g} g</strong>
              </div>
              <div className="stat">
                <span>Salt</span>
                <strong>{bread.nutrition.salt_g} g</strong>
              </div>
            </div>
          </div>
        )}

        {tab === 'pairings' && (
          <div className="panel">
            <h3>Pairings</h3>
            <ul className="pairing-list">
              {bread.pairings.map((p) => (
                <li key={p.title}>
                  <h4>{p.title}</h4>
                  <div className="meta">{p.cuisine}</div>
                  <p>{p.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'reference' && (
          <div className="panel">
            <h3>Reference</h3>
            <p>{bread.description}</p>
            <p className="note">
              Concept imagery is illustrative. Validate every formula in a test kitchen
              before production.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
