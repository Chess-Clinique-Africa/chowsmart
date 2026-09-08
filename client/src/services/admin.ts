import { api, unwrap } from './api';
import type { AdminStats } from '@/types';

export type DbCommandResult = {
  ok: boolean;
  message: string;
  output?: string;
  migrateOutput?: string;
  seedOutput?: string;
};

export const adminService = {
  stats() {
    return unwrap<AdminStats>(api.get('/admin/stats'));
  },
  bootstrapStatus() {
    return unwrap<{ bootstrapAllowed: boolean }>(api.get('/admin/bootstrap-status'));
  },
  migrateDatabase() {
    return unwrap<DbCommandResult>(api.post('/admin/db/migrate', null, { timeout: 180_000 }));
  },
  seedDatabase() {
    return unwrap<DbCommandResult>(api.post('/admin/db/seed', null, { timeout: 360_000 }));
  },
  setupDatabase() {
    return unwrap<DbCommandResult>(api.post('/admin/db/setup', null, { timeout: 420_000 }));
  },
};
