import type { Request, Response } from 'express';
import { success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { param } from '../utils/params.js';
import * as menuPlanService from '../services/menuPlan.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuPlanService.list(req.user!.id, req.query as never);
  return success(res, data);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuPlanService.getById(req.user!.id, param(req, 'id'));
  return success(res, data);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuPlanService.create(req.user!.id, req.body);
  return success(res, data, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuPlanService.update(req.user!.id, param(req, 'id'), req.body);
  return success(res, data);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuPlanService.remove(req.user!.id, param(req, 'id'));
  return success(res, data);
});
