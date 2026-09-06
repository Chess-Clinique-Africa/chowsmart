import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Image } from '@/components/UI/Image';
import { Badge } from '@/components/UI/Badge';
import { Button } from '@/components/UI/Button';
import type { Restaurant } from '@/types';

export function RestaurantCard({
  restaurant,
  favorited,
  onToggleFavorite,
}: {
  restaurant: Restaurant;
  favorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  const navigate = useNavigate();
  const cuisine = restaurant.cuisines?.[0]?.cuisine?.name;

  return (
    <article className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-bg-elevated shadow-soft transition hover:-translate-y-0.5 hover:border-accent/25">
      <Link to={`/restaurants/${restaurant.slug}`}>
        <Image src={restaurant.image} alt={restaurant.name} aspect="aspect-[16/10]" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {cuisine ? <Badge>{cuisine}</Badge> : null}
              <Badge>{restaurant.priceRange}</Badge>
              <Badge>★ {restaurant.rating.toFixed(1)}</Badge>
            </div>
            <h3 className="font-extrabold tracking-tight text-xl">
              <Link to={`/restaurants/${restaurant.slug}`}>{restaurant.name}</Link>
            </h3>
            <p className="text-sm text-muted">
              {restaurant.city}
              {restaurant.state ? `, ${restaurant.state}` : ''}
            </p>
          </div>
          {onToggleFavorite ? (
            <button
              type="button"
              aria-label={favorited ? 'Remove favorite' : 'Save favorite'}
              onClick={onToggleFavorite}
              className={`rounded-full p-2 ${favorited ? 'text-accent-bright' : 'text-muted hover:text-ink'}`}
            >
              <Heart className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />
            </button>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm text-ink-soft">{restaurant.description}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate(`/restaurants/${restaurant.slug}`)}
        >
          View restaurant
        </Button>
      </div>
    </article>
  );
}
