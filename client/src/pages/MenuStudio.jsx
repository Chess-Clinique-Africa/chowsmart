import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function MenuStudio() {
  const [occasion, setOccasion] = useState('dinner');
  const [guests, setGuests] = useState(4);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [saved, setSaved] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refreshSaved() {
    const rows = await api.menus();
    setSaved(rows);
  }

  useEffect(() => {
    refreshSaved().catch((err) => setError(err.message));
  }, []);

  async function handleSuggest(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const result = await api.suggestMenu({ occasion, guests });
      setSuggestion(result);
      setTitle(result.title);
      setNotes(result.notes);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      const items = suggestion
        ? [
            suggestion.bread && {
              type: 'bread',
              slug: suggestion.bread.slug,
              name: suggestion.bread.name,
            },
            ...(suggestion.recipes || []).map((r) => ({
              type: 'recipe',
              slug: r.slug,
              name: r.title,
            })),
          ].filter(Boolean)
        : [];

      await api.saveMenu({
        title: title || `${occasion} for ${guests}`,
        occasion,
        guest_count: guests,
        notes,
        items,
      });
      setMessage('Menu plan saved.');
      await refreshSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="shell section">
      <div className="section-head">
        <span className="eyebrow">Menu studio</span>
        <h2>Plan a thoughtful menu.</h2>
        <p>
          Get an AI-assisted suggestion from the ChowSmart catalogue, then save the plan for
          your guests.
        </p>
      </div>

      <div className="detail-layout">
        <form className="panel form-grid" onSubmit={handleSuggest}>
          <label>
            Occasion
            <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              <option value="breakfast">Breakfast</option>
              <option value="brunch">Brunch</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="dessert">Dessert</option>
            </select>
          </label>
          <label>
            Guests
            <input
              type="number"
              min="1"
              max="40"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Suggest a menu
          </button>

          {suggestion && (
            <div className="suggest-box">
              <h3>{suggestion.title}</h3>
              <ul>
                {suggestion.bread && (
                  <li>
                    Bread:{' '}
                    <Link to={`/breads/${suggestion.bread.slug}`}>
                      {suggestion.bread.name}
                    </Link>{' '}
                    — {suggestion.bread.tagline}
                  </li>
                )}
                {(suggestion.recipes || []).map((r) => (
                  <li key={r.slug}>
                    Recipe: {r.title} ({r.cuisine}, {r.minutes} min)
                  </li>
                ))}
                {(suggestion.restaurants || []).map((r) => (
                  <li key={r.slug}>
                    Nearby inspiration: {r.name}, {r.city}
                  </li>
                ))}
              </ul>
              <p className="note">{suggestion.notes}</p>
            </div>
          )}
        </form>

        <form className="panel form-grid" onSubmit={handleSave}>
          <label>
            Menu title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">
            Save menu plan
          </button>
          {message && <p className="note">{message}</p>}
          {error && <p className="status error">{error}</p>}

          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>
              Saved plans
            </h3>
            {saved.length === 0 && <p className="status">No saved menus yet.</p>}
            <ul className="pairing-list">
              {saved.map((m) => (
                <li key={m.id}>
                  <h4>{m.title}</h4>
                  <div className="meta">
                    {m.occasion || 'occasion n/a'} · {m.guest_count || '?'} guests
                  </div>
                  <p>{m.notes}</p>
                </li>
              ))}
            </ul>
          </div>
        </form>
      </div>
    </section>
  );
}
