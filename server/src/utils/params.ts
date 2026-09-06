import type { Request } from 'express';
import { AppError } from '../middleware/errorHandler.js';

/** Express 5 types params as string | string[]; normalize to a single string. */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved) {
    throw new AppError(`Missing route parameter: ${name}`, 400, 'VALIDATION_ERROR');
  }
  return resolved;
}
