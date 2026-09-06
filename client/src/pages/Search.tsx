import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { useDebounce } from '@/hooks/useDebounce';
import { searchService } from '@/services/search';
import { Skeleton } from '@/components/UI/Skeleton';
import { EmptyState } from '@/components/UI/EmptyState';
import type { SearchResults } from '@/types';

export function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const debounced = useDebounce(q, 350);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setParams(debounced ? { q: debounced } : {});
    if (!debounced.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    searchService
      .search(debounced)
      .then(setResults)
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debounced, setParams]);

  return (
    <section className="page-shell py-12">
      <h1 className="font-extrabold tracking-tight text-4xl">Search</h1>
      <p className="mt-2 text-muted">Restaurants, recipes, breads, menu items and cuisines.</p>
      <div className="mt-6 max-w-xl">
        <SearchBar initial={initial} onSubmit={setQ} />
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : null}

      {!loading && debounced && results ? (
        <div className="mt-10 space-y-10">
          <ResultGroup
            title="Restaurants"
            items={results.restaurants.map((r) => ({
              id: r.id,
              label: r.name,
              href: `/restaurants/${r.slug}`,
              meta: r.city,
            }))}
          />
          <ResultGroup
            title="Recipes"
            items={results.recipes.map((r) => ({
              id: r.id,
              label: r.name,
              href: `/recipes/${r.slug}`,
              meta: r.difficulty,
            }))}
          />
          <ResultGroup
            title="Breads"
            items={results.breads.map((b) => ({
              id: b.id,
              label: b.name,
              href: `/breads/${b.slug}`,
              meta: b.category,
            }))}
          />
          <ResultGroup
            title="Menu items"
            items={results.menuItems.map((m) => ({
              id: m.id,
              label: m.name,
              href: m.restaurant ? `/restaurants/${m.restaurant.slug}` : '/restaurants',
              meta: m.category,
            }))}
          />
          <ResultGroup
            title="Cuisines"
            items={results.cuisines.map((c) => ({
              id: c.id,
              label: c.name,
              href: `/restaurants?cuisine=${c.slug}`,
              meta: c.slug,
            }))}
          />
        </div>
      ) : null}

      {!loading && debounced && results &&
      !results.restaurants.length &&
      !results.recipes.length &&
      !results.breads.length &&
      !results.menuItems.length &&
      !results.cuisines.length ? (
        <div className="mt-8">
          <EmptyState title="No results." description="Try a different keyword." />
        </div>
      ) : null}
    </section>
  );
}

function ResultGroup({
  title,
  items,
}: {
  title: string;
  items: { id: string; label: string; href: string; meta: string }[];
}) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="font-extrabold tracking-tight text-2xl">{title}</h2>
      <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-bg-elevated">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={item.href} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-line/30">
              <span className="font-medium">{item.label}</span>
              <span className="text-sm text-muted">{item.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
