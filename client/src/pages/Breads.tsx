import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, Check, ChefHat } from 'lucide-react';
import { breadsService } from '@/services/breads';
import type { Bread } from '@/types';

const STUDIO_IMAGES: Record<string, string> = {
  'wheat-baguette-bread': '/breads/wheat-studio.png',
  'wrapped-baguette-bread': '/breads/wrapped-studio.png',
  'honey-creamed-bread': '/breads/honey-studio.png',
  'chocolate-creamed-bread': '/breads/chocolate-studio.png',
  'coconut-creamed-bread': '/breads/coconut-studio.png',
};

const METHOD_STEPS: Record<string, string[]> = {
  'wheat-baguette-bread': [
    'Mix the flours, water and yeast. Add salt and knead until elastic.',
    'Cover and ferment for about 60–90 minutes, until visibly expanded. Timing depends on dough temperature.',
    'Divide into baguettes; shape and proof for about 35–50 minutes. Score the surface.',
    'Bake in a preheated oven at 220°C for about 22–28 minutes. Check the centre is fully baked; cool on a rack. Weigh the cooled batch.',
  ],
  'wrapped-baguette-bread': [
    'Mix flour, water, yeast, sugar and oil. Add salt and knead until smooth and elastic.',
    'Bulk ferment until roughly doubled, about 60–75 minutes.',
    'Shape into a travel-friendly baguette, proof 30–45 minutes, then score lightly.',
    'Bake at 220°C for 20–26 minutes. Cool fully before wrapping so the crust stays crisp.',
  ],
  'honey-creamed-bread': [
    'Warm milk, dissolve yeast, then mix with flour, egg, butter and salt into a soft enriched dough.',
    'Ferment until expanded, about 70–90 minutes.',
    'Roll out, spread honey-cream filling, roll and place in a tin. Proof 35–50 minutes.',
    'Bake at 180°C for 28–35 minutes until golden. Cool before slicing.',
  ],
  'chocolate-creamed-bread': [
    'Make an enriched dough with flour, cocoa, milk, egg, butter, sugar, yeast and salt.',
    'Ferment until soft and aerated, about 70–90 minutes.',
    'Fill with chocolate cream, shape, and proof 40–55 minutes.',
    'Bake at 180°C for 30–36 minutes. Cool on a rack before cutting.',
  ],
  'coconut-creamed-bread': [
    'Combine flour, coconut milk, yeast, sugar, egg, butter and salt into a soft dough.',
    'Ferment until risen, about 70–90 minutes.',
    'Spread coconut cream filling with desiccated coconut, roll, and proof 35–50 minutes.',
    'Bake at 180°C for 28–34 minutes. Cool before slicing to keep the swirl clean.',
  ],
};

type TabId = 'recipe' | 'nutrition' | 'pairings' | 'reference';

function breadImage(bread: Bread) {
  return STUDIO_IMAGES[bread.slug] || bread.image;
}

function shortLabel(bread: Bread) {
  if (/wrapped/i.test(bread.name)) return 'Wrapped';
  if (/honey/i.test(bread.name)) return 'Honey';
  if (/chocolate/i.test(bread.name)) return 'Chocolate';
  if (/coconut/i.test(bread.name)) return 'Coconut';
  if (/wheat/i.test(bread.name)) return 'Wheat';
  return bread.name.split(' ')[0];
}

function formatAllergens(allergens: string[]) {
  return allergens
    .map((a) => {
      if (/gluten/i.test(a)) return 'Wheat / gluten';
      return a;
    })
    .join(' · ');
}

function approxPortionGrams(bread: Bread) {
  const note = bread.portionNote || '';
  const match = note.match(/(\d+)\s*g/i);
  if (match) return Number(match[1]);
  return 70;
}

export function Breads() {
  const { slug: routeSlug } = useParams();
  const navigate = useNavigate();
  const [breads, setBreads] = useState<Bread[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(routeSlug || '');
  const [detail, setDetail] = useState<Bread | null>(null);
  const [tab, setTab] = useState<TabId>('recipe');
  const [portions, setPortions] = useState(4);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    breadsService
      .list({ limit: 10 })
      .then((data) => {
        const sorted = [...data.items].sort((a, b) => a.number - b.number);
        setBreads(sorted);
        setSelectedSlug((current) => current || routeSlug || sorted[0]?.slug || '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load breads'))
      .finally(() => setLoading(false));
  }, [routeSlug]);

  useEffect(() => {
    if (routeSlug) setSelectedSlug(routeSlug);
  }, [routeSlug]);

  useEffect(() => {
    if (!selectedSlug) return;
    setDetailLoading(true);
    setTab('recipe');
    breadsService
      .getBySlug(selectedSlug)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedSlug]);

  const selectedSummary = useMemo(
    () => breads.find((b) => b.slug === selectedSlug) || null,
    [breads, selectedSlug]
  );

  function selectBread(slug: string) {
    setSelectedSlug(slug);
    navigate(`/breads/${slug}`, { replace: true });
    requestAnimationFrame(() => {
      document.getElementById('bread-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const basePortion = detail ? approxPortionGrams(detail) : 70;
  const scale = portions / 4;

  return (
    <div className="bread-app">
      <div className="bread-main">
        <div className="bread-heading">
          <div>
            <p className="bread-kicker">THE CHOWSMART BREAD COLLECTION</p>
            <h1>
              Choose your <em>ChowSmart bread.</em>
            </h1>
          </div>
          <p>Select a bread to explore its recipe, nutrition and pairings.</p>
        </div>

        <p className="bread-browse-hint">Explore all five · swipe on smaller screens</p>

        {error ? <p className="bread-error">{error}</p> : null}

        {loading ? (
          <section className="bread-grid" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bread-card" style={{ minHeight: 280 }} />
            ))}
          </section>
        ) : (
          <section aria-label="Five bread collection" className="bread-grid">
            {breads.map((bread) => {
              const selected = bread.slug === selectedSlug;
              return (
                <button
                  key={bread.id}
                  type="button"
                  className={`bread-card${selected ? ' is-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => selectBread(bread.slug)}
                >
                  <div className="bread-photo">
                    <img
                      src={breadImage(bread)}
                      alt={bread.description}
                      loading={bread.number <= 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      width={1536}
                      height={1024}
                    />
                    <span>{String(bread.number).padStart(2, '0')}</span>
                    {selected ? (
                      <i>
                        <Check size={16} aria-hidden />
                      </i>
                    ) : null}
                  </div>
                  <div className="bread-card-copy">
                    <small>{bread.subtitle}</small>
                    <h2>{bread.name}</h2>
                    <span>
                      Explore recipe & pairings <ArrowUpRight size={16} aria-hidden />
                    </span>
                  </div>
                </button>
              );
            })}
          </section>
        )}

        <p className="bread-image-note">
          AI-refined concept images based on your five reference sheets. Illustrations of the
          proposed range, not photographs of manufactured products.
        </p>

        {(detail || selectedSummary) && (
          <section tabIndex={-1} id="bread-details" className="bread-detail">
            <div className="bread-detail-image">
              <img
                src={breadImage(detail || selectedSummary!)}
                alt={(detail || selectedSummary)!.description}
                width={1536}
                height={1024}
              />
              <p>{(detail || selectedSummary)!.description}</p>
            </div>

            <div className="bread-detail-content">
              <div className="bread-switcher" aria-label="Choose a bread">
                {breads.map((bread) => (
                  <button
                    key={bread.id}
                    type="button"
                    aria-pressed={bread.slug === selectedSlug}
                    onClick={() => selectBread(bread.slug)}
                  >
                    {shortLabel(bread)}
                  </button>
                ))}
              </div>

              <p className="bread-kicker">YOUR SELECTED BREAD</p>
              <h2>ChowSmart {(detail || selectedSummary)!.name}</h2>
              <p>{(detail || selectedSummary)!.description}</p>

              <div className="bread-allergens">
                <strong>Modelled allergens</strong>
                <span>{formatAllergens((detail || selectedSummary)!.allergens)}</span>
              </div>

              <div className="bread-tabs" role="tablist" aria-label="Bread details">
                {(
                  [
                    ['recipe', 'Recipe'],
                    ['nutrition', 'Nutrition'],
                    ['pairings', 'Pairings'],
                    ['reference', 'Reference'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {detailLoading || !detail ? (
                <p className="bread-caveat">Loading recipe details…</p>
              ) : tab === 'recipe' ? (
                <div>
                  <div className="bread-portions">
                    <label htmlFor="bread-portions">Recipe portions</label>
                    <input
                      id="bread-portions"
                      type="number"
                      min={1}
                      max={100}
                      value={portions}
                      onChange={(e) => setPortions(Math.max(1, Number(e.target.value) || 1))}
                    />
                    <span>Approx. {Math.round(basePortion * scale)} g each</span>
                  </div>
                  <ul className="bread-ingredients">
                    {(detail.ingredients || []).map((ing) => (
                      <li key={ing.id}>
                        <span>{ing.ingredient}</span>
                        <strong>
                          {(ing.quantity * scale).toFixed(1)} {ing.unit}
                        </strong>
                      </li>
                    ))}
                  </ul>
                  <details className="bread-method" open>
                    <summary>
                      Preparation method · about {detail.prepMinutes ?? '—'} minutes
                    </summary>
                    <ol>
                      {(METHOD_STEPS[detail.slug] || [
                        'Mix, knead and ferment the dough until elastic and expanded.',
                        'Shape and proof according to loaf style.',
                        'Bake until fully set in the centre, then cool on a rack.',
                        'Weigh the cooled batch and validate the formula in your kitchen.',
                      ]).map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </details>
                  <p className="bread-caveat">
                    Development recipe: the filling, ingredient weights and baked yield still need
                    kitchen validation. The reference image alone cannot establish a formula.
                  </p>
                </div>
              ) : tab === 'nutrition' && detail.nutrition ? (
                <div>
                  <p className="bread-caveat">{detail.nutrition.perNote}</p>
                  <dl className="bread-nutrition">
                    <div>
                      <dt>Calories</dt>
                      <dd>{detail.nutrition.calories} kcal</dd>
                    </div>
                    <div>
                      <dt>Protein</dt>
                      <dd>{detail.nutrition.protein} g</dd>
                    </div>
                    <div>
                      <dt>Carbohydrates</dt>
                      <dd>{detail.nutrition.carbohydrates} g</dd>
                    </div>
                    <div>
                      <dt>Fat</dt>
                      <dd>{detail.nutrition.fat} g</dd>
                    </div>
                    <div>
                      <dt>Fibre</dt>
                      <dd>{detail.nutrition.fibre} g</dd>
                    </div>
                    <div>
                      <dt>Sodium</dt>
                      <dd>{detail.nutrition.sodium} mg</dd>
                    </div>
                  </dl>
                </div>
              ) : tab === 'pairings' ? (
                <div className="bread-pairings">
                  {(detail.pairings || []).map((pairing) => (
                    <article key={pairing.id}>
                      <h4>{pairing.foodName}</h4>
                      <p>{pairing.description}</p>
                      <small>{pairing.category}</small>
                    </article>
                  ))}
                  {!detail.pairings?.length ? (
                    <p className="bread-caveat">No pairings listed for this loaf yet.</p>
                  ) : null}
                </div>
              ) : (
                <div className="bread-reference">
                  <p>{detail.description}</p>
                  <p>
                    {detail.reference ||
                      'Concept imagery is illustrative. Validate every formula before production.'}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="bread-next">
          <ChefHat size={28} aria-hidden />
          <div>
            <h2>From a bread to a complete menu.</h2>
            <p>
              Keep exploring Nigerian dishes, worldwide cuisines and voice-assisted menu planning.
            </p>
          </div>
          <div className="bread-next-links">
            <Link to="/restaurants">
              Find a restaurant <ArrowUpRight size={18} aria-hidden />
            </Link>
            <Link to="/menu-studio">
              Open AI menu studio <ArrowUpRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
