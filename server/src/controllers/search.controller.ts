import type { Request, Response } from 'express';
import { z } from 'zod';
import { AppError, success } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as searchService from '../services/search.service.js';

const searchQuerySchema = z.object({
  q: z.string().default(''),
  limit: z.coerce.number().int().min(1).max(50).default(8),
});

export const search = asyncHandler(async (req: Request, res: Response) => {
  const parsed = searchQuerySchema.parse(req.query);
  if (!parsed.q.trim()) {
    throw new AppError('Search query is required', 400, 'VALIDATION_ERROR');
  }
  const data = await searchService.search(parsed.q, parsed.limit);
  return success(res, data);
});
