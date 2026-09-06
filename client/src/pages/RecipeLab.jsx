import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function RecipeLab() {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .recipes()
      .then(setRecipes)
      .catch((err) => setError(err.message));
  }, []);

  async function openRecipe(slug) {
    try {
      const detail = await api.recipe(slug);
      setSelected(detail);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="shell section">
      <div className="section-head">
        <span className="eyebrow">Recipe lab</span>
        <h2>Test kitchen ideas around the collection.</h2>
        <p>Nigerian and Afro-fusion plates that start with a ChowSmart loaf.</p>
      </div>

      {error && <p className="status error">{error}</p>}

      <div className="detail-layout">
        <div className="grid-cards">
          {recipes.map((r) => (
            <button
              key={r.id}
              type="button"
              className="list-card"
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
              onClick={() => openRecipe(r.slug)}
            >
              <div className="meta-row">
                <span>{r.cuisine}</span>
                <span>{r.difficulty}</span>
                <span>{r.minutes} min</span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.summary}</p>
            </button>
          ))}
        </div>

        <div className="panel">
          {!selected && <p className="status">Select a recipe to inspect ingredients and steps.</p>}
          {selected && (
            <>
              <h3>{selected.title}</h3>
              <p>{selected.summary}</p>
              {selected.bread_slug && (
                <p className="note">
                  Paired bread:{' '}
                  <Link to={`/breads/${selected.bread_slug}`}>{selected.bread_slug}</Link>
                </p>
              )}
              <h3 style={{ marginTop: '1.25rem' }}>Ingredients</h3>
              <ul className="ingredient-list">
                {(selected.ingredients || []).map((ing) => (
                  <li key={ing}>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
              <h3 style={{ marginTop: '1.25rem' }}>Steps</h3>
              <ol className="step-list">
                {(selected.steps || []).map((step, i) => (
                  <li key={step}>
                    <span className="n">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
