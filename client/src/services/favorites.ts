import { api, unwrap } from './api';
import type { Favorite, FavoriteType, Paginated } from '@/types';

export const favoritesService = {
  list(params: { page?: number; limit?: number; itemType?: FavoriteType } = {}) {
    return unwrap<Paginated<Favorite>>(api.get('/favorites', { params }));
  },
  add(itemType: FavoriteType, itemId: string) {
    return unwrap<Favorite>(api.post('/favorites', { itemType, itemId }));
  },
  remove(id: string) {
    return unwrap<{ id: string }>(api.delete(`/favorites/${id}`));
  },
};
