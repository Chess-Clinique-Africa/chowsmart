import { api, unwrap } from './api';
import type { MenuPlan, MenuPlanItem, Paginated } from '@/types';

export interface MenuPlanInput {
  name: string;
  description?: string | null;
  items?: Omit<MenuPlanItem, 'id' | 'menuPlanId'>[];
}

export const menuPlansService = {
  list(params: { page?: number; limit?: number } = {}) {
    return unwrap<Paginated<MenuPlan>>(api.get('/menu-plans', { params }));
  },
  getById(id: string) {
    return unwrap<MenuPlan>(api.get(`/menu-plans/${id}`));
  },
  create(data: MenuPlanInput) {
    return unwrap<MenuPlan>(api.post('/menu-plans', data));
  },
  update(id: string, data: Partial<MenuPlanInput>) {
    return unwrap<MenuPlan>(api.put(`/menu-plans/${id}`, data));
  },
  remove(id: string) {
    return unwrap<{ id: string }>(api.delete(`/menu-plans/${id}`));
  },
};
