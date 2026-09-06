import type { Request, Response } from 'express';
import { success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { param } from '../utils/params.js';
import * as breadService from '../services/bread.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await breadService.list(req.query as never);
  return success(res, data);
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const data = await breadService.getBySlug(param(req, 'slug'));
  return success(res, data);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await breadService.create(req.body);
  return success(res, data, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await breadService.update(param(req, 'id'), req.body);
  return success(res, data);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await breadService.remove(param(req, 'id'));
  return success(res, data);
});
