import type { Request, Response } from 'express';
import { success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { param } from '../utils/params.js';
import * as recipeService from '../services/recipe.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await recipeService.list(req.query as never);
  return success(res, data);
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const data = await recipeService.getBySlug(param(req, 'slug'));
  return success(res, data);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await recipeService.create(req.body);
  return success(res, data, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await recipeService.update(param(req, 'id'), req.body);
  return success(res, data);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await recipeService.remove(param(req, 'id'));
  return success(res, data);
});
