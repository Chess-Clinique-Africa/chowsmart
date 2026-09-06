import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeCard } from '@/components/RecipeCard/RecipeCard';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { FilterPanel } from '@/components/FilterPanel/FilterPanel';
import { Skeleton } from '@/components/UI/Skeleton';
import { EmptyState } from '@/components/UI/EmptyState';
import { ErrorState } from '@/components/UI/ErrorState';
import { Button } from '@/components/UI/Button';
import { recipesService } from '@/services/recipes';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import type { Recipe } from '@/types';

export function RecipeLab() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    cuisine: '',
    difficulty: '',
    dietaryTag: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isFavorite, toggleFavorite } = useFavorites('RECIPE');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  async function load(nextPage = 1) {
    setLoading(true);
    setError('');
    try {
      const data = await recipesService.list({
        page: nextPage,
        limit: 9,
        search: search || undefined,
        cuisine: filters.cuisine || undefined,
        difficulty: (filters.difficulty as Recipe['difficulty']) || undefined,
        dietaryTag: filters.dietaryTag || undefined,
      });
      setItems(data.items);
      setPage(data.meta.page);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters.cuisine, filters.difficulty, filters.dietaryTag]);

  return (
    <section className="page-shell py-12">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Recipe lab</p>
        <h1 className="mt-2 font-extrabold tracking-tight text-4xl">Test kitchen ideas around the collection.</h1>
        <p className="mt-3 text-muted">
          Search by cuisine, difficulty and dietary tags — Nigerian classics to global plates.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar onSubmit={setSearch} placeholder="Search recipes or ingredients…" />
        <FilterPanel
          values={filters}
          onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          filters={[
            {
              key: 'cuisine',
              label: 'Cuisine',
              options: [
                { label: 'Nigerian', value: 'nigerian' },
                { label: 'African', value: 'african' },
                { label: 'Italian', value: 'italian' },
                { label: 'Japanese', value: 'japanese' },
                { label: 'Mediterranean', value: 'mediterranean' },
              ],
            },
            {
              key: 'difficulty',
              label: 'Difficulty',
              options: [
                { label: 'Easy', value: 'EASY' },
                { label: 'Medium', value: 'MEDIUM' },
                { label: 'Advanced', value: 'ADVANCED' },
              ],
            },
            {
              key: 'dietaryTag',
              label: 'Dietary',
              options: [
                { label: 'High protein', value: 'high-protein' },
                { label: 'Dairy-free', value: 'dairy-free' },
                { label: 'Vegetarian', value: 'vegetarian' },
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
        <EmptyState title="No recipes found." description="Try changing your search or filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              favorited={isFavorite('RECIPE', recipe.id)}
              onToggleFavorite={() => {
                if (!isAuthenticated) return navigate('/login');
                void toggleFavorite('RECIPE', recipe.id);
              }}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => void load(page - 1)}>
            Previous
          </Button>
          <span className="self-center text-sm text-muted">
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
