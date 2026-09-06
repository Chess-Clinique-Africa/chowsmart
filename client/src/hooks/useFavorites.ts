import { useCallback, useEffect, useMemo, useState } from 'react';
import { favoritesService } from '@/services/favorites';
import { useAuth } from '@/context/AuthContext';
import type { Favorite, FavoriteType } from '@/types';
import { ApiClientError } from '@/services/api';

export function useFavorites(itemType?: FavoriteType) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await favoritesService.list({ limit: 100, itemType });
      setFavorites(data.items);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, itemType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const keyed = useMemo(() => {
    const map = new Map<string, Favorite>();
    favorites.forEach((f) => map.set(`${f.itemType}:${f.itemId}`, f));
    return map;
  }, [favorites]);

  const isFavorite = useCallback(
    (type: FavoriteType, id: string) => keyed.has(`${type}:${id}`),
    [keyed]
  );

  const toggleFavorite = useCallback(
    async (type: FavoriteType, id: string) => {
      if (!isAuthenticated) return { ok: false as const, reason: 'auth' as const };
      const existing = keyed.get(`${type}:${id}`);
      try {
        if (existing) {
          await favoritesService.remove(existing.id);
          setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
          return { ok: true as const, favorited: false };
        }
        const created = await favoritesService.add(type, id);
        setFavorites((prev) => [created, ...prev]);
        return { ok: true as const, favorited: true };
      } catch (err) {
        return {
          ok: false as const,
          reason: 'error' as const,
          message: err instanceof ApiClientError ? err.message : 'Could not update favorite',
        };
      }
    },
    [isAuthenticated, keyed]
  );

  return { favorites, loading, error, refresh, isFavorite, toggleFavorite };
}
