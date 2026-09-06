import { api, unwrap } from './api';
import type { Paginated, Restaurant, RestaurantListParams } from '@/types';

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const q: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') q[key] = String(value);
  });
  return q;
}

export const restaurantsService = {
  list(params: RestaurantListParams = {}) {
    return unwrap<Paginated<Restaurant>>(
      api.get('/restaurants', { params: toQuery(params as Record<string, string | number | boolean | undefined>) })
    );
  },
  getBySlug(slug: string) {
    return unwrap<Restaurant>(api.get(`/restaurants/${slug}`));
  },
  create(data: Partial<Restaurant> & { cuisineIds?: string[] }) {
    return unwrap<Restaurant>(api.post('/restaurants', data));
  },
  update(id: string, data: Partial<Restaurant> & { cuisineIds?: string[] }) {
    return unwrap<Restaurant>(api.put(`/restaurants/${id}`, data));
  },
  remove(id: string) {
    return unwrap<{ id: string }>(api.delete(`/restaurants/${id}`));
  },
};
