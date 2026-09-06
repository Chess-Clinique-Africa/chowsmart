import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Image } from '@/components/UI/Image';
import { Tabs } from '@/components/UI/Tabs';
import { Badge } from '@/components/UI/Badge';
import { Skeleton } from '@/components/UI/Skeleton';
import { ErrorState } from '@/components/UI/ErrorState';
import { NutritionPanel } from '@/components/NutritionPanel/NutritionPanel';
import { PairingPanel } from '@/components/PairingPanel/PairingPanel';
import { breadsService } from '@/services/breads';
import type { Bread } from '@/types';

export function BreadDetails() {
  const { slug = '' } = useParams();
  const [bread, setBread] = useState<Bread | null>(null);
  const [all, setAll] = useState<Bread[]>([]);
  const [tab, setTab] = useState('recipe');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTab('recipe');
    setLoading(true);
    Promise.all([breadsService.getBySlug(slug), breadsService.list({ limit: 10 })])
      .then(([detail, list]) => {
        setBread(detail);
        setAll([...list.items].sort((a, b) => a.number - b.number));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page-shell py-12"><Skeleton className="h-[70vh]" /></div>;
  if (error || !bread) {
    return (
      <div className="page-shell py-12">
        <ErrorState message={error || 'Bread not found'} />
      </div>
    );
  }

  return (
    <section className="page-shell grid gap-8 py-10 lg:grid-cols-2">
      <div className="overflow-hidden rounded-3xl border border-line">
        <Image src={bread.image} alt={bread.name} aspect="aspect-[4/5]" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">{bread.category}</p>
        <h1 className="mt-2 font-extrabold tracking-tight text-4xl">ChowSmart {bread.name}</h1>
        <p className="mt-3 text-lg text-ink-soft">{bread.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {bread.allergens.map((a) => (
            <Badge key={a}>{a}</Badge>
          ))}
          {bread.prepMinutes ? <Badge>Prep ~{bread.prepMinutes} min</Badge> : null}
          {bread.portionNote ? <Badge>{bread.portionNote}</Badge> : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {all.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => navigate(`/breads/${b.slug}`)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                b.slug === bread.slug ? 'border-ink bg-ink text-bg' : 'border-line text-muted'
              }`}
            >
              {b.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'recipe', label: 'Recipe' },
              { id: 'nutrition', label: 'Nutrition' },
              { id: 'pairings', label: 'Pairings' },
              { id: 'reference', label: 'Reference' },
            ]}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-bg-elevated p-5">
          {tab === 'recipe' ? (
            <div>
              <h3 className="font-extrabold tracking-tight text-xl">Ingredients</h3>
              <ul className="mt-3 space-y-2">
                {(bread.ingredients || []).map((ing) => (
                  <li key={ing.id} className="flex justify-between gap-3 border-b border-line py-2 text-sm">
                    <span>{ing.ingredient}</span>
                    <strong>
                      {ing.quantity} {ing.unit}
                    </strong>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">
                Preparation time · about {bread.prepMinutes || '—'} minutes. Knead, ferment, shape and
                bake following the development method for this loaf. Validate weights in the kitchen.
              </p>
              <Link to="/menu-studio" className="mt-4 inline-block text-sm text-accent-bright underline">
                Plan a menu around this bread
              </Link>
            </div>
          ) : null}
          {tab === 'nutrition' && bread.nutrition ? (
            <NutritionPanel nutrition={bread.nutrition} />
          ) : null}
          {tab === 'pairings' ? <PairingPanel pairings={bread.pairings || []} /> : null}
          {tab === 'reference' ? (
            <div className="space-y-3 text-ink-soft">
              <p>{bread.description}</p>
              <p className="text-sm text-muted">
                {bread.reference ||
                  'Concept imagery is illustrative. Validate every formula before production.'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
