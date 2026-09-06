import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Printer } from 'lucide-react';
import { Image } from '@/components/UI/Image';
import { Badge } from '@/components/UI/Badge';
import { Button } from '@/components/UI/Button';
import { Skeleton } from '@/components/UI/Skeleton';
import { ErrorState } from '@/components/UI/ErrorState';
import { recipesService } from '@/services/recipes';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import type { Recipe } from '@/types';

export function RecipeDetails() {
  const { slug = '' } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isFavorite, toggleFavorite } = useFavorites('RECIPE');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    recipesService
      .getBySlug(slug)
      .then(setRecipe)
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page-shell py-12"><Skeleton className="h-96" /></div>;
  if (error || !recipe) {
    return (
      <div className="page-shell py-12">
        <ErrorState message={error || 'Recipe not found'} />
      </div>
    );
  }

  const favorited = isFavorite('RECIPE', recipe.id);

  return (
    <article className="page-shell grid gap-8 py-10 lg:grid-cols-2">
      <Image src={recipe.image} alt={recipe.name} aspect="aspect-[4/5]" className="rounded-3xl" />
      <div>
        <div className="flex flex-wrap gap-2">
          {recipe.cuisine ? <Badge>{recipe.cuisine.name}</Badge> : null}
          <Badge>{recipe.difficulty}</Badge>
          <Badge>
            {recipe.prepTime}+{recipe.cookTime} min
          </Badge>
          <Badge>{recipe.servings} servings</Badge>
        </div>
        <h1 className="mt-4 font-extrabold tracking-tight text-4xl">{recipe.name}</h1>
        <p className="mt-3 text-lg text-ink-soft">{recipe.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (!isAuthenticated) return navigate('/login');
              void toggleFavorite('RECIPE', recipe.id);
            }}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current text-accent-bright' : ''}`} />
            Save Recipe
          </Button>
          <Button onClick={() => navigate('/menu-studio', { state: { recipe } })}>
            Add to Menu
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print Recipe
          </Button>
        </div>

        <h2 className="mt-10 font-extrabold tracking-tight text-2xl">Ingredients</h2>
        <ul className="mt-3 space-y-2">
          {(recipe.ingredients || []).map((ing) => (
            <li key={ing.id} className="flex justify-between border-b border-line py-2 text-sm">
              <span>{ing.ingredient}</span>
              <span className="text-muted">
                {ing.quantity} {ing.unit}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 font-extrabold tracking-tight text-2xl">Instructions</h2>
        <ol className="mt-3 space-y-3">
          {recipe.instructions.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-ink-soft">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {(recipe.calories || recipe.protein) && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recipe.calories ? (
              <div className="rounded-xl border border-line p-3">
                <p className="text-xs text-muted">Calories</p>
                <p className="font-extrabold tracking-tight text-xl">{recipe.calories}</p>
              </div>
            ) : null}
            {recipe.protein != null ? (
              <div className="rounded-xl border border-line p-3">
                <p className="text-xs text-muted">Protein</p>
                <p className="font-extrabold tracking-tight text-xl">{recipe.protein}g</p>
              </div>
            ) : null}
            {recipe.carbohydrates != null ? (
              <div className="rounded-xl border border-line p-3">
                <p className="text-xs text-muted">Carbs</p>
                <p className="font-extrabold tracking-tight text-xl">{recipe.carbohydrates}g</p>
              </div>
            ) : null}
            {recipe.fat != null ? (
              <div className="rounded-xl border border-line p-3">
                <p className="text-xs text-muted">Fat</p>
                <p className="font-extrabold tracking-tight text-xl">{recipe.fat}g</p>
              </div>
            ) : null}
          </div>
        )}

        {recipe.breadSlug ? (
          <p className="mt-6 text-sm">
            Paired bread:{' '}
            <Link className="text-accent-bright underline" to={`/breads/${recipe.breadSlug}`}>
              {recipe.breadSlug}
            </Link>
          </p>
        ) : null}
      </div>
    </article>
  );
}
