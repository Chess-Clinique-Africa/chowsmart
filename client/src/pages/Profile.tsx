import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { menuPlansService } from '@/services/menuPlans';
import { useFavorites } from '@/hooks/useFavorites';
import type { MenuPlan } from '@/types';
import { Badge } from '@/components/UI/Badge';

export function Profile() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [menus, setMenus] = useState<MenuPlan[]>([]);

  useEffect(() => {
    menuPlansService
      .list({ limit: 20 })
      .then((data) => setMenus(data.items))
      .catch(() => setMenus([]));
  }, []);

  if (!user) return null;

  return (
    <section className="page-shell py-12">
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-extrabold tracking-tight text-accent">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="font-extrabold tracking-tight text-4xl">{user.name}</h1>
          <p className="text-muted">{user.email}</p>
          <Badge className="mt-2">{user.role}</Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-bg-elevated p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold tracking-tight text-2xl">Saved favorites</h2>
            <Link to="/favorites" className="text-sm text-muted hover:text-ink">
              Manage
            </Link>
          </div>
          <p className="text-sm text-muted">{favorites.length} saved items</p>
          <ul className="mt-4 space-y-2 text-sm">
            {favorites.slice(0, 6).map((f) => (
              <li key={f.id} className="flex justify-between border-b border-line py-2">
                <span>{f.itemType}</span>
                <span className="text-muted">{f.itemId.slice(0, 8)}…</span>
              </li>
            ))}
            {favorites.length === 0 ? <li className="text-muted">No favorites yet.</li> : null}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-bg-elevated p-5">
          <h2 className="font-extrabold tracking-tight text-2xl">Saved menus</h2>
          <ul className="mt-4 space-y-3">
            {menus.map((menu) => (
              <li key={menu.id} className="rounded-xl border border-line p-3">
                <p className="font-medium">{menu.name}</p>
                <p className="text-sm text-muted">
                  {menu.items?.length || 0} items · {new Date(menu.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
            {menus.length === 0 ? <li className="text-sm text-muted">No saved menus yet.</li> : null}
          </ul>
          <Link to="/menu-studio" className="mt-4 inline-block text-sm text-accent-bright underline">
            Open Menu Studio
          </Link>
        </div>
      </div>
    </section>
  );
}
