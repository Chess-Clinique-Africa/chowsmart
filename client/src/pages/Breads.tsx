import { useEffect, useState } from 'react';
import { BreadCard } from '@/components/BreadCard/BreadCard';
import { Skeleton } from '@/components/UI/Skeleton';
import { ErrorState } from '@/components/UI/ErrorState';
import { breadsService } from '@/services/breads';
import type { Bread } from '@/types';

export function Breads() {
  const [breads, setBreads] = useState<Bread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await breadsService.list({ limit: 10 });
      setBreads([...data.items].sort((a, b) => a.number - b.number));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load breads');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="page-shell py-12">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Our breads</p>
        <h1 className="mt-2 font-extrabold tracking-tight text-4xl">The ChowSmart bread collection</h1>
        <p className="mt-3 text-muted">
          Select a bread to explore its recipe, nutrition and pairings. Swipe on smaller screens.
        </p>
      </div>
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          <Skeleton className="h-80 min-w-[240px]" />
          <Skeleton className="h-80 min-w-[240px]" />
          <Skeleton className="h-80 min-w-[240px]" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
          {breads.map((bread) => (
            <BreadCard key={bread.id} bread={bread} />
          ))}
        </div>
      )}
    </section>
  );
}
