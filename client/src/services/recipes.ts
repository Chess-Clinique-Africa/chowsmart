import { api, unwrap } from './api';
import type { Paginated, Recipe, RecipeListParams } from '@/types';

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const q: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') q[key] = String(value);
  });
  return q;
}

export const recipesService = {
  list(params: RecipeListParams = {}) {
    return unwrap<Paginated<Recipe>>(
      api.get('/recipes', { params: toQuery(params as Record<string, string | number | boolean | undefined>) })
    );
  },
  getBySlug(slug: string) {
    return unwrap<Recipe>(api.get(`/recipes/${slug}`));
  },
  create(data: Partial<Recipe>) {
    return unwrap<Recipe>(api.post('/recipes', data));
  },
  update(id: string, data: Partial<Recipe>) {
    return unwrap<Recipe>(api.put(`/recipes/${id}`, data));
  },
  remove(id: string) {
    return unwrap<{ id: string }>(api.delete(`/recipes/${id}`));
  },
};
