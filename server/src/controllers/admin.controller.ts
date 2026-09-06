import type { Request, Response } from 'express';
import { success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as adminService from '../services/admin.service.js';

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getStats();
  return success(res, data);
});
