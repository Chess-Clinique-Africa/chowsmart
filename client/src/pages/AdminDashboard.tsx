import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Plus, RefreshCw } from 'lucide-react';
import { adminService, type DbCommandResult } from '@/services/admin';
import { restaurantsService } from '@/services/restaurants';
import { recipesService } from '@/services/recipes';
import { breadsService } from '@/services/breads';
import { Skeleton } from '@/components/UI/Skeleton';
import { ErrorState } from '@/components/UI/ErrorState';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';
import {
  CatalogEditorPanel,
  type CatalogEditor,
} from '@/components/Admin/CatalogEditorPanel';
import type { AdminStats, Bread, Recipe, Restaurant } from '@/types';

type DeleteTarget = {
  kind: 'restaurant' | 'recipe' | 'bread';
  id: string;
  name: string;
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [breads, setBreads] = useState<Bread[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [dbBusy, setDbBusy] = useState(false);
  const [dbLog, setDbLog] = useState('');
  const [editor, setEditor] = useState<CatalogEditor | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [s, r, rec, b] = await Promise.all([
        adminService.stats(),
        restaurantsService.list({ limit: 50 }),
        recipesService.list({ limit: 50 }),
        breadsService.list({ limit: 50 }),
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

  async function runDbAction(
    label: string,
    action: () => Promise<DbCommandResult>,
    confirmText: string
  ) {
    if (!window.confirm(confirmText)) return;
    setDbBusy(true);
    setMessage('');
    setError('');
    setDbLog('');
    try {
      const result = await action();
      setMessage(result.message || `${label} finished`);
      setDbLog(
        [result.output, result.migrateOutput, result.seedOutput].filter(Boolean).join('\n\n')
      );
      try {
        await load();
      } catch {
        // Seed recreates users; an old JWT may break follow-up loads.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `${label} failed`);
    } finally {
      setDbBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setMessage('');
    setError('');
    try {
      if (deleteTarget.kind === 'restaurant') {
        await restaurantsService.remove(deleteTarget.id);
      } else if (deleteTarget.kind === 'recipe') {
        await recipesService.remove(deleteTarget.id);
      } else {
        await breadsService.remove(deleteTarget.id);
      }
      setMessage(`Deleted “${deleteTarget.name}”`);
      if (
        editor &&
        editor.mode === 'edit' &&
        editor.kind === deleteTarget.kind &&
        editor.item.id === deleteTarget.id
      ) {
        setEditor(null);
      }
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  async function saveRestaurant(payload: Record<string, unknown>) {
    if (!editor || editor.kind !== 'restaurant') return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (editor.mode === 'create') {
        const created = await restaurantsService.create(
          payload as Parameters<typeof restaurantsService.create>[0]
        );
        setMessage(`Created restaurant “${created.name}”`);
      } else {
        const updated = await restaurantsService.update(
          editor.item.id,
          payload as Parameters<typeof restaurantsService.update>[1]
        );
        setMessage(`Updated restaurant “${updated.name}”`);
      }
      setEditor(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save restaurant');
    } finally {
      setSaving(false);
    }
  }

  async function saveRecipe(payload: Record<string, unknown>) {
    if (!editor || editor.kind !== 'recipe') return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (editor.mode === 'create') {
        const created = await recipesService.create(
          payload as Parameters<typeof recipesService.create>[0]
        );
        setMessage(`Created recipe “${created.name}”`);
      } else {
        const updated = await recipesService.update(
          editor.item.id,
          payload as Parameters<typeof recipesService.update>[1]
        );
        setMessage(`Updated recipe “${updated.name}”`);
      }
      setEditor(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save recipe');
    } finally {
      setSaving(false);
    }
  }

  async function saveBread(payload: Record<string, unknown>) {
    if (!editor || editor.kind !== 'bread') return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (editor.mode === 'create') {
        const created = await breadsService.create(
          payload as Parameters<typeof breadsService.create>[0]
        );
        setMessage(`Created bread “${created.name}”`);
      } else {
        const updated = await breadsService.update(
          editor.item.id,
          payload as Parameters<typeof breadsService.update>[1]
        );
        setMessage(`Updated bread “${updated.name}”`);
      }
      setEditor(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save bread');
    } finally {
      setSaving(false);
    }
  }

  if (loading && !stats) {
    return (
      <div className="page-shell max-w-[1320px] grid gap-4 py-12 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <section className="page-shell max-w-[1320px] py-12">
      <h1 className="font-extrabold tracking-tight text-4xl">Admin dashboard</h1>
      <p className="mt-2 text-muted">
        Manage restaurants, recipes, and breads — plus database migrate/seed tools.
      </p>
      {error ? (
        <div className="mt-4">
          <ErrorState message={error} onRetry={() => void load()} />
        </div>
      ) : null}
      {message ? <p className="mt-4 text-sm text-success">{message}</p> : null}

      <div className="mt-8 rounded-2xl border border-line bg-bg-elevated p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-extrabold tracking-tight text-2xl">
              <Database size={22} aria-hidden />
              Database
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Run Prisma migrate and seed against the API server&apos;s{' '}
              <code className="text-ink">DATABASE_URL</code>. Seed clears existing catalogue data and
              recreates demo users — you may need to log in again afterward.
            </p>
          </div>
          <Button variant="outline" size="sm" disabled={dbBusy || loading} onClick={() => void load()}>
            <RefreshCw size={14} aria-hidden />
            Refresh
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="outline"
            disabled={dbBusy}
            onClick={() =>
              void runDbAction(
                'Migrate',
                () => adminService.migrateDatabase(),
                'Apply pending Prisma migrations to the connected database?'
              )
            }
          >
            {dbBusy ? 'Working…' : 'Migrate'}
          </Button>
          <Button
            variant="outline"
            disabled={dbBusy}
            onClick={() =>
              void runDbAction(
                'Seed',
                () => adminService.seedDatabase(),
                'Seed will DELETE existing users, restaurants, recipes, breads, and menus, then reload demo data. Continue?'
              )
            }
          >
            Seed
          </Button>
          <Button
            disabled={dbBusy}
            onClick={() =>
              void runDbAction(
                'Setup',
                () => adminService.setupDatabase(),
                'Migrate then seed? This will wipe catalogue data and recreate demo accounts.'
              )
            }
          >
            Migrate + seed
          </Button>
        </div>

        {dbLog ? (
          <pre className="mt-4 max-h-56 overflow-auto rounded-xl bg-ink/5 p-3 text-xs leading-relaxed text-muted whitespace-pre-wrap">
            {dbLog}
          </pre>
        ) : null}

        <p className="mt-4 text-xs text-muted">
          Empty remote DB with no admin yet? Use{' '}
          <Link to="/setup" className="text-accent-bright underline">
            /setup
          </Link>{' '}
          while bootstrap is allowed.
        </p>
      </div>

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

      <CatalogEditorPanel
        editor={editor}
        saving={saving}
        onCancel={() => setEditor(null)}
        onSaveRestaurant={saveRestaurant}
        onSaveRecipe={saveRecipe}
        onSaveBread={saveBread}
      />

      <Modal
        open={!!deleteTarget}
        title="Delete item"
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        size="sm"
        closeDisabled={deleting}
      >
        <p className="text-sm text-muted">
          Delete <span className="font-semibold text-ink">“{deleteTarget?.name}”</span>? This cannot
          be undone.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="danger" loading={deleting} onClick={() => void confirmDelete()}>
            Delete
          </Button>
          <Button
            variant="outline"
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AdminList
          title="Restaurants"
          onAdd={() => setEditor({ kind: 'restaurant', mode: 'create' })}
          rows={restaurants.map((r) => ({
            id: r.id,
            name: r.name,
            meta: `${r.city} · ${r.priceRange}`,
            onEdit: () => setEditor({ kind: 'restaurant', mode: 'edit', item: r }),
            onDelete: () => setDeleteTarget({ kind: 'restaurant', id: r.id, name: r.name }),
          }))}
        />
        <AdminList
          title="Recipes"
          onAdd={() => setEditor({ kind: 'recipe', mode: 'create' })}
          rows={recipes.map((r) => ({
            id: r.id,
            name: r.name,
            meta: r.difficulty,
            onEdit: () => setEditor({ kind: 'recipe', mode: 'edit', item: r }),
            onDelete: () => setDeleteTarget({ kind: 'recipe', id: r.id, name: r.name }),
          }))}
        />
        <AdminList
          title="Breads"
          onAdd={() => setEditor({ kind: 'bread', mode: 'create' })}
          rows={breads.map((b) => ({
            id: b.id,
            name: b.name,
            meta: `#${b.number} · ${b.category}`,
            onEdit: () => setEditor({ kind: 'bread', mode: 'edit', item: b }),
            onDelete: () => setDeleteTarget({ kind: 'bread', id: b.id, name: b.name }),
          }))}
        />
      </div>
    </section>
  );
}

function AdminList({
  title,
  rows,
  onAdd,
}: {
  title: string;
  onAdd: () => void;
  rows: {
    id: string;
    name: string;
    meta: string;
    onEdit: () => void;
    onDelete: () => void;
  }[];
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-line bg-bg-elevated p-5">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
        <h2 className="min-w-0 truncate font-extrabold tracking-tight text-base leading-none">
          {title}
        </h2>
        <Button type="button" variant="outline" size="sm" className="shrink-0 px-3" onClick={onAdd}>
          <Plus size={14} aria-hidden />
          Add
        </Button>
      </div>
      <ul className="max-h-96 space-y-2 overflow-y-auto">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-2 border-b border-line py-2 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{row.name}</p>
              <p className="text-xs text-muted">{row.meta}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="sm" onClick={row.onEdit}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={row.onDelete}>
                Delete
              </Button>
            </div>
          </li>
        ))}
        {rows.length === 0 ? <li className="py-3 text-sm text-muted">No items yet.</li> : null}
      </ul>
    </div>
  );
}
