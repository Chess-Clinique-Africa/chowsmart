import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Image } from '@/components/UI/Image';
import { Badge } from '@/components/UI/Badge';
import type { Recipe } from '@/types';

export function RecipeCard({
  recipe,
  favorited,
  onToggleFavorite,
}: {
  recipe: Recipe;
  favorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-bg-elevated shadow-soft transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_18px_40px_rgba(8,127,91,0.1)]">
      <Link to={`/recipes/${recipe.slug}`}>
        <Image src={recipe.image} alt={recipe.name} />
      </Link>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {recipe.cuisine ? <Badge>{recipe.cuisine.name}</Badge> : null}
            <Badge>{recipe.difficulty}</Badge>
            <Badge>{recipe.prepTime + recipe.cookTime} min</Badge>
            {recipe.calories ? <Badge>{recipe.calories} kcal</Badge> : null}
          </div>
          {onToggleFavorite ? (
            <button
              type="button"
              aria-label={favorited ? 'Remove favorite' : 'Save recipe'}
              onClick={onToggleFavorite}
              className={`rounded-full p-1.5 ${favorited ? 'text-accent-bright' : 'text-muted'}`}
            >
              <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
          ) : null}
        </div>
        <h3 className="font-extrabold tracking-tight text-xl">
          <Link to={`/recipes/${recipe.slug}`}>{recipe.name}</Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{recipe.description}</p>
      </div>
    </article>
  );
}
