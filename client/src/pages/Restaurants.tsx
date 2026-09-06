import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantCard } from '@/components/RestaurantCard/RestaurantCard';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { FilterPanel } from '@/components/FilterPanel/FilterPanel';
import { Skeleton } from '@/components/UI/Skeleton';
import { EmptyState } from '@/components/UI/EmptyState';
import { ErrorState } from '@/components/UI/ErrorState';
import { Button } from '@/components/UI/Button';
import { restaurantsService } from '@/services/restaurants';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import type { Restaurant } from '@/types';

export function Restaurants() {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ cuisine: '', city: '', price: '', rating: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isFavorite, toggleFavorite } = useFavorites('RESTAURANT');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  async function load(nextPage = page) {
    setLoading(true);
    setError('');
    try {
      const data = await restaurantsService.list({
        page: nextPage,
        limit: 9,
        search: search || undefined,
        cuisine: filters.cuisine || undefined,
        city: filters.city || undefined,
        price: filters.price || undefined,
        rating: filters.rating ? Number(filters.rating) : undefined,
      });
      setItems(data.items);
      setTotalPages(data.meta.totalPages);
      setPage(data.meta.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters.cuisine, filters.city, filters.price, filters.rating]);

  return (
    <section className="page-shell py-12">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Restaurants</p>
        <h1 className="mt-2 font-extrabold tracking-tight text-4xl">Find a place that serves ChowSmart well.</h1>
        <p className="mt-3 text-muted">
          Search by cuisine, city, price and rating across Nigeria and beyond.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar
          onSubmit={(q) => setSearch(q)}
          placeholder="Search restaurants…"
        />
        <FilterPanel
          values={filters}
          onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          filters={[
            {
              key: 'cuisine',
              label: 'Cuisine',
              options: [
                { label: 'Nigerian', value: 'nigerian' },
                { label: 'Italian', value: 'italian' },
                { label: 'Chinese', value: 'chinese' },
                { label: 'Indian', value: 'indian' },
                { label: 'American', value: 'american' },
                { label: 'Mediterranean', value: 'mediterranean' },
                { label: 'African', value: 'african' },
              ],
            },
            {
              key: 'city',
              label: 'City',
              options: [
                { label: 'Lagos', value: 'Lagos' },
                { label: 'Abuja', value: 'Abuja' },
                { label: 'Port Harcourt', value: 'Port Harcourt' },
                { label: 'Ibadan', value: 'Ibadan' },
                { label: 'Kano', value: 'Kano' },
              ],
            },
            {
              key: 'price',
              label: 'Price',
              options: [
                { label: '₦', value: '₦' },
                { label: '₦₦', value: '₦₦' },
                { label: '₦₦₦', value: '₦₦₦' },
              ],
            },
            {
              key: 'rating',
              label: 'Min rating',
              options: [
                { label: '4.0+', value: '4' },
                { label: '4.5+', value: '4.5' },
              ],
            },
          ]}
        />
      </div>

      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No restaurants found."
          description="Try changing your search or filters."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              favorited={isFavorite('RESTAURANT', restaurant.id)}
              onToggleFavorite={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                void toggleFavorite('RESTAURANT', restaurant.id);
              }}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => void load(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => void load(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
}
