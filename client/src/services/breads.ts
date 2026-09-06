import { api, unwrap } from './api';
import type { Bread, BreadListParams, Paginated } from '@/types';

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const q: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') q[key] = String(value);
  });
  return q;
}

export const breadsService = {
  list(params: BreadListParams = {}) {
    return unwrap<Paginated<Bread>>(
      api.get('/breads', { params: toQuery(params as Record<string, string | number | boolean | undefined>) })
    );
  },
  getBySlug(slug: string) {
    return unwrap<Bread>(api.get(`/breads/${slug}`));
  },
  create(data: Partial<Bread>) {
    return unwrap<Bread>(api.post('/breads', data));
  },
  update(id: string, data: Partial<Bread>) {
    return unwrap<Bread>(api.put(`/breads/${id}`, data));
  },
  remove(id: string) {
    return unwrap<{ id: string }>(api.delete(`/breads/${id}`));
  },
};
