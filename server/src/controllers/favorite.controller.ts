import type { Request, Response } from 'express';
import { success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { param } from '../utils/params.js';
import * as favoriteService from '../services/favorite.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await favoriteService.list(req.user!.id, req.query as never);
  return success(res, data);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await favoriteService.create(req.user!.id, req.body);
  return success(res, data, 201);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await favoriteService.remove(req.user!.id, param(req, 'id'));
  return success(res, data);
});
