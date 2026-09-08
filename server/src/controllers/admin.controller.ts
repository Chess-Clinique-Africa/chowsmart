import type { Request, Response, NextFunction } from 'express';
import { success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import * as adminService from '../services/admin.service.js';

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getStats();
  return success(res, data);
});

export const migrate = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.migrateDatabase();
  return success(res, data);
});

export const seed = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.seedDatabase();
  return success(res, data);
});

export const setup = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.setupDatabase();
  return success(res, data);
});

export const bootstrapStatus = asyncHandler(async (_req: Request, res: Response) => {
  const allowed = await adminService.isBootstrapAllowed();
  return success(res, { bootstrapAllowed: allowed });
});

/** Allow admin JWT, or unauthenticated access while the database has no users / no tables. */
export async function requireAdminOrBootstrap(req: Request, res: Response, next: NextFunction) {
  try {
    const allowed = await adminService.isBootstrapAllowed();
    if (allowed) return next();
  } catch {
    return next();
  }

  authenticate(req, res, (authErr) => {
    if (authErr) return next(authErr);
    requireAdmin(req, res, next);
  });
}
