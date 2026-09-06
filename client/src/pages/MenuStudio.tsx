import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuBuilder } from '@/components/MenuBuilder/MenuBuilder';
import { ErrorState } from '@/components/UI/ErrorState';
import { menuItemsService } from '@/services/menuItems';
import { breadsService } from '@/services/breads';
import { recipesService } from '@/services/recipes';
import { menuPlansService } from '@/services/menuPlans';
import { useAuth } from '@/context/AuthContext';
import type { CanvasMenuItem, Recipe } from '@/types';

export function MenuStudio() {
  const [library, setLibrary] = useState<CanvasMenuItem[]>([]);
  const [items, setItems] = useState<CanvasMenuItem[]>([]);
  const [menuName, setMenuName] = useState('Untitled menu');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const recipeFromState = (location.state as { recipe?: Recipe } | null)?.recipe;

  useEffect(() => {
    Promise.all([
      menuItemsService.list({ limit: 40 }),
      breadsService.list({ limit: 10 }),
      recipesService.list({ limit: 20 }),
    ])
      .then(([menuItems, breads, recipes]) => {
        const mapped: CanvasMenuItem[] = [
          ...menuItems.items.map((m) => ({
            clientId: m.id,
            itemType: 'MENU_ITEM' as const,
            itemId: m.id,
            name: m.name,
            quantity: 1,
            calories: m.calories,
            price: m.price,
            categoryLabel: m.category,
          })),
          ...breads.items.map((b) => ({
            clientId: b.id,
            itemType: 'BREAD' as const,
            itemId: b.id,
            name: b.name,
            quantity: 1,
            calories: b.nutrition?.calories ? Math.round(b.nutrition.calories) : 200,
            price: 0,
            categoryLabel: 'BREAD',
          })),
          ...recipes.items.map((r) => ({
            clientId: r.id,
            itemType: 'RECIPE' as const,
            itemId: r.id,
            name: r.name,
            quantity: 1,
            calories: r.calories,
            price: null,
            categoryLabel: 'RECIPE',
          })),
        ];
        // Also expose by meal category aliases for menu items
        const withAliases = mapped.flatMap((item) => {
          if (item.itemType !== 'MENU_ITEM') return [item];
          const cat = (item.categoryLabel || '').toLowerCase();
          let alias = item;
          if (cat.includes('starter') || cat.includes('appetizer')) {
            alias = { ...item, itemType: 'STARTER' };
          } else if (cat.includes('main')) {
            alias = { ...item, itemType: 'MAIN' };
          } else if (cat.includes('side')) {
            alias = { ...item, itemType: 'SIDE' };
          } else if (cat.includes('dessert')) {
            alias = { ...item, itemType: 'DESSERT' };
          } else if (cat.includes('drink') || cat.includes('beverage')) {
            alias = { ...item, itemType: 'DRINK' };
          }
          return [alias, item];
        });
        setLibrary(withAliases);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load catalogue'));
  }, []);

  useEffect(() => {
    if (!recipeFromState) return;
    setItems((prev) => [
      ...prev,
      {
        clientId: `recipe-${recipeFromState.id}-${Date.now()}`,
        itemType: 'RECIPE',
        itemId: recipeFromState.id,
        name: recipeFromState.name,
        quantity: 1,
        calories: recipeFromState.calories,
        price: null,
        categoryLabel: 'RECIPE',
      },
    ]);
  }, [recipeFromState]);

  const uniqueLibrary = useMemo(() => {
    const seen = new Set<string>();
    return library.filter((item) => {
      const key = `${item.itemType}:${item.itemId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [library]);

  async function handleSave() {
    setMessage('');
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/menu-studio' } });
      return;
    }
    setSaving(true);
    try {
      await menuPlansService.create({
        name: menuName,
        description: 'Created in Menu Studio',
        items: items.map((item, index) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          notes: item.notes || null,
          sortOrder: index,
          calories: item.calories ?? null,
          price: item.price ?? null,
        })),
      });
      setMessage('Menu saved to your account.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save menu');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-shell py-12">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Menu studio</p>
        <h1 className="mt-2 font-extrabold tracking-tight text-4xl">Plan a thoughtful menu.</h1>
        <p className="mt-3 text-muted">
          Add dishes, reorder, adjust quantities and save a complete plan with calorie and cost
          estimates.
        </p>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {message ? <p className="mb-4 text-sm text-success">{message}</p> : null}

      <MenuBuilder
        library={uniqueLibrary}
        items={items}
        onItemsChange={setItems}
        menuName={menuName}
        onMenuNameChange={setMenuName}
        onSave={() => void handleSave()}
        onClear={() => setItems([])}
        saving={saving}
      />
    </section>
  );
}
