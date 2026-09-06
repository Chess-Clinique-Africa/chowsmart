import type { Pairing } from '@/types';
import { Image } from '@/components/UI/Image';

export function PairingPanel({ pairings }: { pairings: Pairing[] }) {
  if (!pairings.length) {
    return <p className="text-muted">No pairings listed yet.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {pairings.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-xl border border-line bg-bg">
          {p.image ? <Image src={p.image} alt={p.foodName} aspect="aspect-[16/9]" /> : null}
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-bright">{p.category}</p>
            <h4 className="mt-1 font-extrabold tracking-tight text-lg">{p.foodName}</h4>
            <p className="mt-2 text-sm text-muted">{p.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
