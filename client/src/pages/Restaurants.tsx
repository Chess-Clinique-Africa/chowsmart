import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { RestaurantCard } from '@/components/RestaurantCard/RestaurantCard';
import { restaurantsService } from '@/services/restaurants';
import type { Restaurant } from '@/types';

const REGIONS = [
  { label: 'All regions', value: '' },
  { label: 'Nigeria', value: 'Nigeria' },
  { label: 'Africa', value: 'Africa' },
  { label: 'EMEA', value: 'EMEA' },
];

const CITIES = [
  { label: 'All cities', value: '' },
  { label: 'Lagos', value: 'Lagos' },
  { label: 'Abuja', value: 'Abuja' },
  { label: 'Port Harcourt', value: 'Port Harcourt' },
  { label: 'Ibadan', value: 'Ibadan' },
  { label: 'Kano', value: 'Kano' },
];

const DIETS = [
  { label: 'Any preference', value: '' },
  { label: 'Halal', value: 'halal' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-free', value: 'gluten' },
];

type SourceTab = 'official' | 'local';

function matchesDiet(restaurant: Restaurant, diet: string) {
  if (!diet) return true;
  if (diet === 'halal') return true;
  const items = restaurant.menuItems ?? [];
  if (!items.length) return true;
  if (diet === 'gluten') {
    return items.some((item) => !item.allergens.some((a) => /gluten|wheat/i.test(a)));
  }
  if (diet === 'vegetarian' || diet === 'vegan') {
    return items.some(
      (item) => !item.allergens.some((a) => /meat|fish|shellfish|egg|dairy|milk/i.test(a))
    );
  }
  return true;
}

export function Restaurants() {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [region, setRegion] = useState('Nigeria');
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');
  const [draftQuery, setDraftQuery] = useState('');
  const [diet, setDiet] = useState('');
  const [tab, setTab] = useState<SourceTab>('official');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await restaurantsService.list({
        page: 1,
        limit: 50,
        search: query || undefined,
        city: city || undefined,
      });
      setItems(data.items);
      setTotal(data.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, city]);

  const filtered = useMemo(() => {
    return items.filter((restaurant) => {
      if (region && region !== 'Africa' && region !== 'EMEA') {
        if (restaurant.country.toLowerCase() !== region.toLowerCase()) return false;
      }
      if (tab === 'local' && restaurant.website) return false;
      if (!matchesDiet(restaurant, diet)) return false;
      return true;
    });
  }, [items, region, tab, diet]);

  const profileCount = useMemo(() => items.length, [items]);

  const activeFilters = [region, city].filter(Boolean);
  const checkedLabel = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function clearFilters() {
    setRegion('Nigeria');
    setCity('');
    setQuery('');
    setDraftQuery('');
    setDiet('');
  }

  function suggestFood() {
    setQuery(draftQuery.trim());
  }

  return (
    <div className="directory-app">
      <div className="directory-main">
        <section className="directory-heading">
          <div>
            <p className="directory-eyebrow">GOOD FOOD, CLOSER TO YOU</p>
            <h1>Where shall we eat?</h1>
            <p>
              Discover restaurant menus and local kitchens.
              <br />
              Choose a place, find a dish, and go straight to the source.
            </p>
          </div>
          <div className="directory-facts">
            <span>
              <strong>{profileCount || total}</strong> official-source profiles
            </span>
            <span>
              <strong>30</strong> city search areas
            </span>
          </div>
        </section>

        <section className="directory-search" aria-label="Restaurant filters">
          <div className="directory-choice">
            <label htmlFor="restaurant-region">Region</label>
            <select
              id="restaurant-region"
              aria-label="Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {REGIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="directory-choice">
            <label htmlFor="restaurant-city">City</label>
            <select
              id="restaurant-city"
              aria-label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {CITIES.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="directory-query">
            <label htmlFor="restaurant-query">What are you craving?</label>
            <div>
              <Search size={17} aria-hidden />
              <input
                id="restaurant-query"
                type="search"
                maxLength={100}
                placeholder="Rice, grills, café, restaurant…"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') suggestFood();
                }}
              />
            </div>
          </div>

          <button type="button" className="directory-primary" onClick={suggestFood}>
            <Sparkles size={17} aria-hidden />
            Suggest food
          </button>
        </section>

        <div className="directory-diet">
          <div className="directory-choice">
            <label htmlFor="restaurant-diet">Dietary requirement</label>
            <select
              id="restaurant-diet"
              aria-label="Dietary requirement"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
            >
              {DIETS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeFilters.length > 0 ? (
          <div className="directory-filter-status">
            <span>{activeFilters.join(' · ')}</span>
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : null}

        <div className="directory-tabs">
          <div className="directory-tab-row">
            <div className="directory-tab-list" role="tablist" aria-label="Listing source">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'official'}
                onClick={() => setTab('official')}
              >
                <BookOpen size={15} aria-hidden />
                Official menu sources
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'local'}
                onClick={() => setTab('local')}
              >
                <MapPin size={15} aria-hidden />
                Local map listings
              </button>
            </div>
            <span>
              {loading ? 'Loading…' : `${filtered.length} matching profile${filtered.length === 1 ? '' : 's'}`}
            </span>
          </div>

          {tab === 'official' ? (
            <div className="directory-section-note">
              <Check size={16} aria-hidden />
              <p>
                Images illustrate dish types, not the restaurants’ actual meals. These profiles link
                to restaurants’ own menus. Food examples were checked on {checkedLabel}; they are
                not live stock or price feeds. Select a branch on the official site before visiting
                or ordering.
              </p>
            </div>
          ) : (
            <div className="directory-section-note">
              <Check size={16} aria-hidden />
              <p>
                Local map listings are community-oriented profiles. Confirm opening hours, address
                and menu details directly with the venue before visiting.
              </p>
            </div>
          )}

          {error ? <div className="directory-error">{error}</div> : null}

          {loading ? (
            <div className="directory-cards" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <article key={i} className="restaurant-card" style={{ minHeight: 320 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="directory-empty">
              <h2>No matching profiles</h2>
              <p>Try another city, clear filters, or switch listing source.</p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="directory-cards">
              {filtered.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} listingMode={tab} />
              ))}
            </div>
          )}
        </div>

        <section className="directory-bottom">
          <div>
            <h2>Your preferences, in the conversation.</h2>
            <p>
              Discuss menu ideas with ChowSmart, then check ingredients, allergens, pricing and
              availability with the restaurant.
            </p>
          </div>
          <Link to="/menu-studio">
            Open AI menu studio <ArrowRight size={18} aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  );
}
