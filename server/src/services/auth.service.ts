import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { signToken, type AuthUser } from '../middleware/auth.js';
import type { LoginInput, RegisterInput } from '../validators/auth.js';

function toAuthUser(user: {
  id: string;
  email: string;
  role: AuthUser['role'];
  name: string;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  role: AuthUser['role'];
  avatar: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new AppError('Email already registered', 409, 'CONFLICT');
  }

  const rounds = process.env.NODE_ENV === 'test' ? 4 : 12;
  const passwordHash = await bcrypt.hash(input.password, rounds);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash,
    },
  });

  const authUser = toAuthUser(user);
  return {
    user: publicUser(user),
    token: signToken(authUser),
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const authUser = toAuthUser(user);
  return {
    user: publicUser(user),
    token: signToken(authUser),
  };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  return publicUser(user);
}
