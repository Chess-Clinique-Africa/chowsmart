import type { Request, Response } from 'express';
import { success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.register(req.body);
  return success(res, data, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.login(req.body);
  return success(res, data);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.me(req.user!.id);
  return success(res, data);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  return success(res, { message: 'Logged out successfully' });
});
