import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs } from '@/components/UI/Tabs';
import { Button } from '@/components/UI/Button';
import { EmptyState } from '@/components/UI/EmptyState';
import { useFavorites } from '@/hooks/useFavorites';
import type { FavoriteType } from '@/types';

const tabs: { id: FavoriteType; label: string }[] = [
  { id: 'RESTAURANT', label: 'Restaurants' },
  { id: 'RECIPE', label: 'Recipes' },
  { id: 'BREAD', label: 'Breads' },
  { id: 'MENU_ITEM', label: 'Menu Items' },
];

export function Favorites() {
  const [tab, setTab] = useState<FavoriteType>('RESTAURANT');
  const { favorites, loading, toggleFavorite } = useFavorites();

  const filtered = useMemo(
    () => favorites.filter((f) => f.itemType === tab),
    [favorites, tab]
  );

  return (
    <section className="page-shell py-12">
      <h1 className="font-extrabold tracking-tight text-4xl">Favorites</h1>
      <p className="mt-2 text-muted">Restaurants, recipes, breads and menu items you have saved.</p>
      <div className="mt-6">
        <Tabs
          tabs={tabs}
          active={tab}
          onChange={(id) => setTab(id as FavoriteType)}
        />
      </div>

      {loading ? (
        <p className="mt-8 text-muted">Loading favorites…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing saved in this tab."
            description="Browse the catalogue and tap the heart to save items."
            actionLabel="Explore restaurants"
            onAction={() => {
              window.location.href = '/restaurants';
            }}
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {filtered.map((fav) => {
            const href =
              fav.itemType === 'RESTAURANT' && fav.item && 'slug' in fav.item
                ? `/restaurants/${(fav.item as { slug: string }).slug}`
                : fav.itemType === 'RECIPE' && fav.item && 'slug' in fav.item
                  ? `/recipes/${(fav.item as { slug: string }).slug}`
                  : fav.itemType === 'BREAD' && fav.item && 'slug' in fav.item
                    ? `/breads/${(fav.item as { slug: string }).slug}`
                    : undefined;
            const name =
              fav.item && 'name' in fav.item
                ? String((fav.item as { name: string }).name)
                : fav.itemId;

            return (
              <li
                key={fav.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-bg-elevated p-4"
              >
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-muted">{fav.itemType}</p>
                </div>
                <div className="flex gap-2">
                  {href ? (
                    <Link to={href} className="text-sm text-accent-bright underline">
                      Open
                    </Link>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void toggleFavorite(fav.itemType, fav.itemId)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
