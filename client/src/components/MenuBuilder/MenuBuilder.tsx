import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { formatCurrency } from '@/utils/format';
import type { CanvasMenuItem, MenuItemType } from '@/types';

const CATEGORIES: { id: MenuItemType; label: string }[] = [
  { id: 'STARTER', label: 'Starters' },
  { id: 'MAIN', label: 'Main Courses' },
  { id: 'SIDE', label: 'Sides' },
  { id: 'DESSERT', label: 'Desserts' },
  { id: 'DRINK', label: 'Drinks' },
  { id: 'BREAD', label: 'Bread' },
  { id: 'RECIPE', label: 'Recipes' },
  { id: 'MENU_ITEM', label: 'Menu Items' },
];

function SortableRow({
  item,
  onChange,
  onRemove,
}: {
  item: CanvasMenuItem;
  onChange: (id: string, patch: Partial<CanvasMenuItem>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.clientId,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 rounded-xl border border-line bg-bg-elevated p-3 sm:flex-row sm:items-center"
    >
      <button
        type="button"
        className="self-start rounded p-1 text-muted hover:text-ink"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{item.name}</p>
        <p className="text-xs text-muted">{item.categoryLabel || item.itemType}</p>
      </div>
      <Input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(e) => onChange(item.clientId, { quantity: Number(e.target.value) || 1 })}
        className="w-20"
        aria-label="Quantity"
      />
      <Input
        value={item.notes || ''}
        onChange={(e) => onChange(item.clientId, { notes: e.target.value })}
        placeholder="Notes"
        className="sm:w-40"
      />
      <button
        type="button"
        onClick={() => onRemove(item.clientId)}
        className="rounded-full p-2 text-muted hover:text-danger"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

export function MenuBuilder({
  library,
  items,
  onItemsChange,
  menuName,
  onMenuNameChange,
  onSave,
  onClear,
  saving,
}: {
  library: CanvasMenuItem[];
  items: CanvasMenuItem[];
  onItemsChange: (items: CanvasMenuItem[]) => void;
  menuName: string;
  onMenuNameChange: (name: string) => void;
  onSave: () => void;
  onClear: () => void;
  saving?: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<MenuItemType>('MAIN');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filteredLibrary = useMemo(
    () => library.filter((i) => i.itemType === activeCategory || i.categoryLabel === activeCategory),
    [library, activeCategory]
  );

  const summary = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const calories = items.reduce((sum, i) => sum + (i.calories || 0) * i.quantity, 0);
    const cost = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
    return { count, calories, cost };
  }, [items]);

  function addItem(item: CanvasMenuItem) {
    onItemsChange([
      ...items,
      { ...item, clientId: `${item.itemId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ]);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.clientId === active.id);
    const newIndex = items.findIndex((i) => i.clientId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onItemsChange(arrayMove(items, oldIndex, newIndex));
  }

  function exportMenu() {
    const payload = {
      name: menuName,
      items,
      summary,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${menuName.replace(/\s+/g, '-').toLowerCase() || 'menu'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_260px]">
      <aside className="rounded-2xl border border-line bg-bg-elevated p-3">
        <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-muted">
          Categories
        </p>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                  activeCategory === cat.id
                    ? 'bg-accent text-white'
                    : 'text-muted hover:bg-accent/5 hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto border-t border-line pt-4">
          {filteredLibrary.length === 0 ? (
            <p className="px-2 text-xs text-muted">No items in this category yet.</p>
          ) : (
            filteredLibrary.map((item) => (
              <button
                key={`${item.itemType}-${item.itemId}`}
                type="button"
                onClick={() => addItem(item)}
                className="w-full rounded-xl border border-line px-3 py-2 text-left text-sm hover:border-accent/40"
              >
                <span className="block font-medium">{item.name}</span>
                <span className="text-xs text-muted">
                  {item.calories ? `${item.calories} kcal` : 'Add'}
                  {item.price ? ` · ${formatCurrency(item.price)}` : ''}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="rounded-2xl border border-line bg-bg-elevated p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <Input
            label="Menu name"
            value={menuName}
            onChange={(e) => onMenuNameChange(e.target.value)}
            className="max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportMenu} disabled={!items.length}>
              Export Menu
            </Button>
            <Button variant="ghost" onClick={onClear} disabled={!items.length}>
              Clear Menu
            </Button>
            <Button onClick={onSave} loading={saving} disabled={!menuName.trim() || !items.length}>
              Save Menu
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.clientId)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3">
              {items.length === 0 ? (
                <li className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
                  Drag in dishes from the left, or click to add them to your canvas.
                </li>
              ) : (
                items.map((item) => (
                  <SortableRow
                    key={item.clientId}
                    item={item}
                    onChange={(id, patch) =>
                      onItemsChange(items.map((i) => (i.clientId === id ? { ...i, ...patch } : i)))
                    }
                    onRemove={(id) => onItemsChange(items.filter((i) => i.clientId !== id))}
                  />
                ))
              )}
            </ul>
          </SortableContext>
        </DndContext>
      </section>

      <aside className="h-fit rounded-2xl border border-line bg-bg-elevated p-4">
        <h3 className="font-extrabold tracking-tight text-xl">Menu summary</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Items</dt>
            <dd className="font-medium">{summary.count}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Est. calories</dt>
            <dd className="font-medium">{summary.calories.toLocaleString()} kcal</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Est. cost</dt>
            <dd className="font-medium">{formatCurrency(summary.cost)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
