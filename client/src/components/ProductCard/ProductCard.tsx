import { Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import type { MenuItem } from '@/types';

export function ProductCard({ item, onAdd }: { item: MenuItem; onAdd?: (item: MenuItem) => void }) {
  const image = item.image || '/menus/restaurant/ofada.webp';

  return (
    <article className="premium-card overflow-hidden rounded-[8px]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#edf1ed]">
        <img src={image} alt={item.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
        {!item.available ? <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white">Sold out</span> : null}
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{item.category}</p>
        <h3 className="mt-2 text-lg font-bold text-ink">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <strong className="text-lg text-ink">{formatCurrency(item.price)}</strong>
          <button type="button" onClick={() => onAdd?.(item)} disabled={!item.available} className="inline-flex items-center gap-1.5 rounded-[8px] bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={16} aria-hidden /> Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}