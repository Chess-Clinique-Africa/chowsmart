import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Sparkles } from 'lucide-react';
import type { Restaurant } from '@/types';

function formatChecked(date: string) {
  try {
    return new Date(date).toISOString().slice(0, 10);
  } catch {
    return date.slice(0, 10);
  }
}

function dishImage(restaurant: Restaurant, itemImage: string | null | undefined, index: number) {
  if (itemImage) return itemImage;
  if (restaurant.image) return restaurant.image;
  const fallbacks = ['/menus/restaurant/ofada.webp', '/menus/beans.webp', '/menus/world/NG.webp'];
  return fallbacks[index % fallbacks.length];
}

export function RestaurantCard({
  restaurant,
  listingMode = 'official',
}: {
  restaurant: Restaurant;
  listingMode?: 'official' | 'local';
}) {
  const cuisineNames =
    restaurant.cuisines
      ?.map((c) => c.cuisine?.name)
      .filter(Boolean)
      .join(' · ') || 'Local kitchen';
  const hasWebsite = Boolean(restaurant.website);
  const official = listingMode === 'official' && hasWebsite;
  const dishes = (restaurant.menuItems ?? []).slice(0, 3);
  const sourceLabel =
    listingMode === 'local' ? 'Local listing' : official ? 'Official source' : 'Menu profile';
  const communityBadge = listingMode === 'local' || !official;

  return (
    <article className="restaurant-card">
      <div className="restaurant-card-top">
        <span className="restaurant-initial" aria-hidden>
          {restaurant.name.charAt(0).toUpperCase()}
        </span>
        <span className={`restaurant-source-badge${communityBadge ? ' community' : ''}`}>
          {sourceLabel}
        </span>
      </div>

      <span className="restaurant-location">
        <MapPin size={13} aria-hidden />
        {restaurant.city} · {restaurant.country}
      </span>

      <h2>
        <Link to={`/restaurants/${restaurant.slug}`}>{restaurant.name}</Link>
      </h2>
      <p className="restaurant-cuisine">{cuisineNames}</p>
      <p className="restaurant-unverified">Halal evidence: not recorded</p>

      {dishes.length > 0 ? (
        <div className="restaurant-foods">
          <small>EXPLORE ON THE MENU</small>
          <ul>
            {dishes.map((item, index) => (
              <li key={item.id}>
                <figure className="menu-visual menu-visual-compact">
                  <img
                    src={dishImage(restaurant, item.image, index)}
                    alt={`${item.name} — illustrative serving idea`}
                    loading="lazy"
                    decoding="async"
                    width={768}
                    height={512}
                  />
                  <figcaption>
                    {item.name}
                    <small>AI illustration · serving may vary</small>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="restaurant-foods">
          <small>EXPLORE ON THE MENU</small>
          <ul>
            <li>
              <p style={{ color: '#728577', fontSize: 14 }}>{restaurant.description}</p>
            </li>
          </ul>
        </div>
      )}

      <div className="restaurant-card-bottom">
        <p>Source checked {formatChecked(restaurant.updatedAt)}</p>
        <div>
          {official && restaurant.website ? (
            <a href={restaurant.website} target="_blank" rel="noreferrer">
              Official menu <ArrowUpRight size={16} aria-hidden />
            </a>
          ) : (
            <Link to={`/restaurants/${restaurant.slug}`}>
              {listingMode === 'local' ? 'View listing' : 'View profile'}{' '}
              <ArrowUpRight size={16} aria-hidden />
            </Link>
          )}
          <Link
            className="restaurant-ai-link"
            to={`/menu-studio?restaurant=${encodeURIComponent(restaurant.slug)}`}
            aria-label={`Discuss ${restaurant.name} with ChowSmart`}
          >
            <Sparkles size={16} aria-hidden />
            Discuss
          </Link>
        </div>
      </div>
    </article>
  );
}
