import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Image } from '@/components/UI/Image';
import { Badge } from '@/components/UI/Badge';
import { Button } from '@/components/UI/Button';
import { Skeleton } from '@/components/UI/Skeleton';
import { ErrorState } from '@/components/UI/ErrorState';
import { restaurantsService } from '@/services/restaurants';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/format';
import type { Restaurant } from '@/types';

export function RestaurantDetails() {
  const { slug = '' } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites('RESTAURANT');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    restaurantsService
      .getBySlug(slug)
      .then(setRestaurant)
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const categories = useMemo(() => {
    const map = new Map<string, NonNullable<Restaurant['menuItems']>>();
    restaurant?.menuItems?.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });
    return [...map.entries()];
  }, [restaurant]);

  if (loading) return <div className="page-shell py-12"><Skeleton className="h-96" /></div>;
  if (error || !restaurant) {
    return (
      <div className="page-shell py-12">
        <ErrorState message={error || 'Restaurant not found'} onRetry={() => navigate(0)} />
      </div>
    );
  }

  const favorited = isFavorite('RESTAURANT', restaurant.id);

  return (
    <article>
      <div className="relative">
        <Image src={restaurant.image} alt={restaurant.name} aspect="aspect-[21/9]" className="max-h-[420px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="page-shell absolute inset-x-0 bottom-0 pb-8 text-white">
          <div className="flex flex-wrap gap-2">
            {restaurant.cuisines?.map((c) => (
              <Badge key={c.cuisineId} className="border-white/30 bg-white/10 text-white">
                {c.cuisine.name}
              </Badge>
            ))}
            <Badge className="border-white/30 bg-white/10 text-white">{restaurant.priceRange}</Badge>
            <Badge className="border-white/30 bg-white/10 text-white">★ {restaurant.rating}</Badge>
          </div>
          <h1 className="mt-3 font-extrabold tracking-tight text-4xl text-white sm:text-5xl">{restaurant.name}</h1>
          <p className="mt-2 text-white/85">
            {restaurant.address}, {restaurant.city}
          </p>
        </div>
      </div>

      <div className="page-shell grid gap-10 py-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-lg text-ink-soft">{restaurant.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (!isAuthenticated) return navigate('/login');
                void toggleFavorite('RESTAURANT', restaurant.id);
              }}
            >
              <Heart className={`h-4 w-4 ${favorited ? 'fill-current text-accent-bright' : ''}`} />
              {favorited ? 'Saved' : 'Favorite'}
            </Button>
            <Button onClick={() => navigate('/menu-studio')}>
              Build a menu from this restaurant
            </Button>
          </div>

          <h2 className="mt-10 font-extrabold tracking-tight text-3xl">Menu</h2>
          <div className="mt-6 space-y-8">
            {categories.map(([category, items]) => (
              <section key={category}>
                <h3 className="mb-3 font-extrabold tracking-tight text-xl">{category}</h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-1 rounded-xl border border-line bg-bg-elevated p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted">{item.description}</p>
                        {item.allergens?.length ? (
                          <p className="mt-1 text-xs text-muted">
                            Allergens: {item.allergens.join(', ')}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{formatCurrency(item.price)}</p>
                        {item.calories ? <p className="text-muted">{item.calories} kcal</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-line bg-bg-elevated p-5">
          <h3 className="font-extrabold tracking-tight text-xl">Details</h3>
          {restaurant.phone ? <p className="text-sm"><span className="text-muted">Phone: </span>{restaurant.phone}</p> : null}
          {restaurant.email ? <p className="text-sm"><span className="text-muted">Email: </span>{restaurant.email}</p> : null}
          {restaurant.website ? (
            <p className="text-sm">
              <span className="text-muted">Web: </span>
              <a href={restaurant.website} className="text-accent-bright underline" target="_blank" rel="noreferrer">
                Visit site
              </a>
            </p>
          ) : null}
          {restaurant.openingHours ? (
            <div>
              <p className="mb-2 text-sm text-muted">Opening hours</p>
              <ul className="space-y-1 text-sm">
                {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                  <li key={day} className="flex justify-between gap-3 capitalize">
                    <span>{day}</span>
                    <span className="text-muted">
                      {typeof hours === 'string'
                        ? hours
                        : hours && typeof hours === 'object' && 'open' in (hours as object)
                          ? `${(hours as { open: string; close: string }).open}–${(hours as { open: string; close: string }).close}`
                          : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link to="/restaurants" className="inline-block text-sm text-muted hover:text-ink">
            ← Back to restaurants
          </Link>
        </aside>
      </div>
    </article>
  );
}
