import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const execFileAsync = promisify(execFile);
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

let busy = false;

function assertNotBusy() {
  if (busy) {
    throw new AppError('A database operation is already running', 409, 'DB_BUSY');
  }
}

async function runNpx(args: string[], timeoutMs: number) {
  try {
    const { stdout, stderr } = await execFileAsync(npxBin, args, {
      cwd: serverRoot,
      env: process.env,
      timeout: timeoutMs,
      maxBuffer: 4 * 1024 * 1024,
    });
    return [stdout, stderr].filter(Boolean).join('\n').trim();
  } catch (err) {
    const error = err as { message?: string; stdout?: string; stderr?: string };
    const detail = [error.stderr, error.stdout, error.message].filter(Boolean).join('\n').trim();
    throw new AppError(detail.slice(0, 2000) || 'Command failed', 500, 'DB_COMMAND_FAILED');
  }
}

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  assertNotBusy();
  busy = true;
  try {
    return await fn();
  } finally {
    busy = false;
  }
}

/** True when the DB has no users yet, or the User table does not exist (needs migrate). */
export async function isBootstrapAllowed() {
  try {
    return (await prisma.user.count()) === 0;
  } catch {
    return true;
  }
}

export async function getStats() {
  const [
    users,
    restaurants,
    recipes,
    breads,
    menuItems,
    menuPlans,
    favorites,
    cuisines,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.restaurant.count(),
    prisma.recipe.count(),
    prisma.bread.count(),
    prisma.menuItem.count(),
    prisma.menuPlan.count(),
    prisma.favorite.count(),
    prisma.cuisine.count(),
  ]);

  return {
    users,
    restaurants,
    recipes,
    breads,
    menuItems,
    menuPlans,
    favorites,
    cuisines,
  };
}

export async function migrateDatabase() {
  return withLock(async () => {
    try {
      const output = await runNpx(['prisma', 'migrate', 'deploy'], 120_000);
      return {
        ok: true as const,
        message: 'Migrations applied successfully',
        output,
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw new AppError(`Migration failed: ${err.message}`, 500, 'MIGRATE_FAILED');
      }
      throw err;
    }
  });
}

export async function seedDatabase() {
  return withLock(async () => {
    try {
      const output = await runNpx(['tsx', 'prisma/seed.ts'], 300_000);
      return {
        ok: true as const,
        message:
          'Database seeded. Demo login: admin@chowsmart.app / Admin123! (re-login if your session breaks).',
        output,
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw new AppError(`Seed failed: ${err.message}`, 500, 'SEED_FAILED');
      }
      throw err;
    }
  });
}

export async function setupDatabase() {
  return withLock(async () => {
    let migrateOutput = '';
    try {
      migrateOutput = await runNpx(['prisma', 'migrate', 'deploy'], 120_000);
    } catch (err) {
      if (err instanceof AppError) {
        throw new AppError(`Migration failed: ${err.message}`, 500, 'MIGRATE_FAILED');
      }
      throw err;
    }

    let seedOutput = '';
    try {
      seedOutput = await runNpx(['tsx', 'prisma/seed.ts'], 300_000);
    } catch (err) {
      if (err instanceof AppError) {
        throw new AppError(`Seed failed: ${err.message}`, 500, 'SEED_FAILED');
      }
      throw err;
    }

    return {
      ok: true as const,
      message:
        'Database migrated and seeded. Demo login: admin@chowsmart.app / Admin123!',
      migrateOutput,
      seedOutput,
    };
  });
}
