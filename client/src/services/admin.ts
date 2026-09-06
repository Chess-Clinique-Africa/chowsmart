import { api, unwrap } from './api';
import type { AdminStats } from '@/types';

export const adminService = {
  stats() {
    return unwrap<AdminStats>(api.get('/admin/stats'));
  },
};
