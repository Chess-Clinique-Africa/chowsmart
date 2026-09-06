import { api, unwrap } from './api';
import type { MenuItem, MenuItemListParams, Paginated } from '@/types';

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const q: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') q[key] = String(value);
  });
  return q;
}

export const menuItemsService = {
  list(params: MenuItemListParams = {}) {
    return unwrap<Paginated<MenuItem>>(
      api.get('/menu-items', {
        params: toQuery(params as Record<string, string | number | boolean | undefined>),
      })
    );
  },
  listByRestaurant(restaurantId: string) {
    return unwrap<MenuItem[]>(api.get(`/menu-items/restaurant/${restaurantId}`));
  },
  getById(id: string) {
    return unwrap<MenuItem>(api.get(`/menu-items/${id}`));
  },
  create(data: Partial<MenuItem>) {
    return unwrap<MenuItem>(api.post('/menu-items', data));
  },
  update(id: string, data: Partial<MenuItem>) {
    return unwrap<MenuItem>(api.put(`/menu-items/${id}`, data));
  },
  remove(id: string) {
    return unwrap<{ id: string }>(api.delete(`/menu-items/${id}`));
  },
};
