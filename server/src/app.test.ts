import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

vi.mock('./config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('pino-http', () => ({
  default: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { prisma } from './config/prisma.js';
import { createApp } from './app.js';
import { signToken } from './middleware/auth.js';

const mockedPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

describe('health', () => {
  it('GET /api/health returns ok', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: 'ok' } });
  });
});

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/auth/register creates a user and returns a token', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    mockedPrisma.user.create.mockResolvedValue({
      id: 'user_1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      avatar: null,
      createdAt: new Date('2026-01-01'),
      passwordHash: 'hashed',
    });

    const app = createApp();
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('ada@example.com');
    expect(res.body.data.token).toBeTypeOf('string');
  });

  it('POST /api/auth/login rejects invalid credentials', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const app = createApp();
    const res = await request(app).post('/api/auth/login').send({
      email: 'missing@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/auth/login returns a token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      avatar: null,
      createdAt: new Date('2026-01-01'),
      passwordHash,
    });

    const app = createApp();
    const res = await request(app).post('/api/auth/login').send({
      email: 'ada@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTypeOf('string');
  });

  it('GET /api/auth/me requires authentication', async () => {
    const app = createApp();
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/auth/me returns the current user', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      avatar: null,
      createdAt: new Date('2026-01-01'),
      passwordHash: 'hashed',
    });

    const token = signToken({
      id: 'user_1',
      email: 'ada@example.com',
      role: Role.USER,
      name: 'Ada Lovelace',
    });

    const app = createApp();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('ada@example.com');
  });

  it('POST /api/auth/logout returns success', async () => {
    const app = createApp();
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('404', () => {
  it('unknown routes return NOT_FOUND', async () => {
    const app = createApp();
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
