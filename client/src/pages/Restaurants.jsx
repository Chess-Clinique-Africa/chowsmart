import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Restaurants() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (city) params.city = city;
    api
      .restaurants(params)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [q, city]);

  const cities = ['', 'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'];

  return (
    <section className="shell section">
      <div className="section-head">
        <span className="eyebrow">Restaurants</span>
        <h2>Find a place that serves ChowSmart well.</h2>
        <p>Discover restaurants across Nigeria featuring the bread collection and thoughtful menus.</p>
      </div>

      <div className="form-grid" style={{ marginBottom: '1.5rem', maxWidth: 520 }}>
        <label>
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cuisine, name, specialty…"
          />
        </label>
        <label>
          City
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.map((c) => (
              <option key={c || 'all'} value={c}>
                {c || 'All cities'}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="status error">{error}</p>}
      {loading && <p className="status">Loading restaurants…</p>}

      <div className="grid-cards">
        {items.map((r) => (
          <article key={r.id} className="list-card">
            <div className="meta-row">
              <span>{r.city}</span>
              <span>{r.cuisine}</span>
              <span>{r.price_band}</span>
              <span>★ {r.rating}</span>
            </div>
            <h3>{r.name}</h3>
            <p>{r.summary}</p>
            <p className="note">{r.specialties?.join(' · ')}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
