import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { restaurantsService } from '@/services/restaurants';
import { recipesService } from '@/services/recipes';
import { breadsService } from '@/services/breads';
import { Skeleton } from '@/components/UI/Skeleton';
import { ErrorState } from '@/components/UI/ErrorState';
import { Button } from '@/components/UI/Button';
import type { AdminStats, Bread, Recipe, Restaurant } from '@/types';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [breads, setBreads] = useState<Bread[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [s, r, rec, b] = await Promise.all([
        adminService.stats(),
        restaurantsService.list({ limit: 20 }),
        recipesService.list({ limit: 20 }),
        breadsService.list({ limit: 20 }),
      ]);
      setStats(s);
      setRestaurants(r.items);
      setRecipes(rec.items);
      setBreads(b.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function removeRestaurant(id: string, name: string) {
    if (!window.confirm(`Delete restaurant “${name}”?`)) return;
    setMessage('');
    try {
      await restaurantsService.remove(id);
      setMessage(`Deleted ${name}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function removeRecipe(id: string, name: string) {
    if (!window.confirm(`Delete recipe “${name}”?`)) return;
    try {
      await recipesService.remove(id);
      setMessage(`Deleted ${name}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function removeBread(id: string, name: string) {
    if (!window.confirm(`Delete bread “${name}”?`)) return;
    try {
      await breadsService.remove(id);
      setMessage(`Deleted ${name}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  if (loading) {
    return (
      <div className="page-shell grid gap-4 py-12 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <section className="page-shell py-12">
      <h1 className="font-extrabold tracking-tight text-4xl">Admin dashboard</h1>
      <p className="mt-2 text-muted">Catalogue statistics and destructive CRUD controls.</p>
      {error ? <div className="mt-4"><ErrorState message={error} onRetry={() => void load()} /></div> : null}
      {message ? <p className="mt-4 text-sm text-success">{message}</p> : null}

      {stats ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-line bg-bg-elevated p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{key}</p>
              <p className="mt-1 font-extrabold tracking-tight text-3xl">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <AdminList
          title="Restaurants"
          rows={restaurants.map((r) => ({ id: r.id, name: r.name, meta: r.city }))}
          onDelete={removeRestaurant}
        />
        <AdminList
          title="Recipes"
          rows={recipes.map((r) => ({ id: r.id, name: r.name, meta: r.difficulty }))}
          onDelete={removeRecipe}
        />
        <AdminList
          title="Breads"
          rows={breads.map((b) => ({ id: b.id, name: b.name, meta: `#${b.number}` }))}
          onDelete={removeBread}
        />
      </div>
    </section>
  );
}

function AdminList({
  title,
  rows,
  onDelete,
}: {
  title: string;
  rows: { id: string; name: string; meta: string }[];
  onDelete: (id: string, name: string) => Promise<void>;
}) {
  return (
    <div className="rounded-2xl border border-line bg-bg-elevated p-4">
      <h2 className="font-extrabold tracking-tight text-2xl">{title}</h2>
      <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-2 border-b border-line py-2 text-sm">
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-xs text-muted">{row.meta}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void onDelete(row.id, row.name)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
