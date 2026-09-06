import type { Request, Response } from 'express';
import { success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { param } from '../utils/params.js';
import * as menuItemService from '../services/menuItem.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuItemService.list(req.query as never);
  return success(res, data);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuItemService.getById(param(req, 'id'));
  return success(res, data);
});

export const listByRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuItemService.listByRestaurant(param(req, 'restaurantId'));
  return success(res, data);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuItemService.create(req.body);
  return success(res, data, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuItemService.update(param(req, 'id'), req.body);
  return success(res, data);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuItemService.remove(param(req, 'id'));
  return success(res, data);
});
