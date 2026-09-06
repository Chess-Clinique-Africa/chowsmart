import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as AuthUser;
    req.user = payload;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    req.user = jwt.verify(header.slice(7), env.jwtSecret) as AuthUser;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  if (req.user.role !== Role.ADMIN) {
    return next(new AppError('Admin access required', 403, 'FORBIDDEN'));
  }
  next();
}
