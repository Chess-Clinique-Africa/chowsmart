import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { promisify } from 'util';
import { tsImport } from 'tsx/esm/api';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));

let busy = false;

function assertNotBusy() {
  if (busy) {
    throw new AppError('A database operation is already running', 409, 'DB_BUSY');
  }
}

function resolveServerRoot() {
  const candidates = [
    process.cwd(),
    path.resolve(here, '../..'),
    path.resolve(here, '../../..'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'prisma', 'schema.prisma'))) {
      return candidate;
    }
  }

  throw new AppError(
    `Cannot find prisma/schema.prisma (cwd=${process.cwd()}, service=${here})`,
    500,
    'PRISMA_ROOT_MISSING'
  );
}

function resolveBin(serverRoot: string, segments: string[]) {
  const full = path.join(serverRoot, ...segments);
  if (!fs.existsSync(full)) {
    throw new AppError(`Missing binary: ${full}`, 500, 'BIN_MISSING');
  }
  return full;
}

async function runNode(args: string[], timeoutMs: number, cwd: string) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, args, {
      cwd,
      env: {
        ...process.env,
        PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK,
      },
      timeout: timeoutMs,
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true,
    });
    return [stdout, stderr].filter(Boolean).join('\n').trim();
  } catch (err) {
    const error = err as {
      message?: string;
      stdout?: string;
      stderr?: string;
      code?: string | number;
    };
    const detail = [error.stderr, error.stdout, error.message]
      .filter(Boolean)
      .join('\n')
      .trim();
    throw new AppError(detail.slice(0, 2500) || 'Command failed', 500, 'DB_COMMAND_FAILED');
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

async function runMigrate(serverRoot: string) {
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    throw new AppError(
      'DATABASE_URL / DIRECT_URL are not set on the server',
      500,
      'DB_ENV_MISSING'
    );
  }

  const prismaCli = resolveBin(serverRoot, ['node_modules', 'prisma', 'build', 'index.js']);
  try {
    return await runNode([prismaCli, 'migrate', 'deploy'], 180_000, serverRoot);
  } catch (err) {
    if (err instanceof AppError) {
      throw new AppError(`Migration failed: ${err.message}`, 500, 'MIGRATE_FAILED');
    }
    throw err;
  }
}

async function runSeed(serverRoot: string) {
  const seedFile = path.join(serverRoot, 'prisma', 'seed.ts');
  if (!fs.existsSync(seedFile)) {
    throw new AppError(`Seed file not found at ${seedFile}`, 500, 'SEED_MISSING');
  }

  try {
    const seedUrl = pathToFileURL(seedFile).href;
    const mod = (await tsImport(seedUrl, import.meta.url)) as {
      main?: () => Promise<Record<string, number>>;
    };
    if (typeof mod.main !== 'function') {
      throw new Error('prisma/seed.ts does not export main()');
    }
    const counts = await mod.main();
    return JSON.stringify(counts, null, 2);
  } catch (err) {
    // Fallback: CLI seed (useful if tsImport fails in some hosts)
    try {
      const tsxCli = resolveBin(serverRoot, ['node_modules', 'tsx', 'dist', 'cli.mjs']);
      return await runNode([tsxCli, seedFile], 360_000, serverRoot);
    } catch (fallbackErr) {
      const primary = err instanceof Error ? err.message : String(err);
      const secondary =
        fallbackErr instanceof AppError
          ? fallbackErr.message
          : fallbackErr instanceof Error
            ? fallbackErr.message
            : String(fallbackErr);
      throw new AppError(
        `Seed failed: ${primary}\n\nFallback also failed: ${secondary}`.slice(0, 2500),
        500,
        'SEED_FAILED'
      );
    }
  }
}

export async function migrateDatabase() {
  return withLock(async () => {
    const serverRoot = resolveServerRoot();
    const output = await runMigrate(serverRoot);
    return {
      ok: true as const,
      message: 'Migrations applied successfully',
      output: output || 'No pending migrations (or migrate completed with no output).',
    };
  });
}

export async function seedDatabase() {
  return withLock(async () => {
    const serverRoot = resolveServerRoot();
    const output = await runSeed(serverRoot);
    return {
      ok: true as const,
      message:
        'Database seeded. Demo login: admin@chowsmart.app / Admin123! Sign in again if your session breaks.',
      output,
    };
  });
}

export async function setupDatabase() {
  return withLock(async () => {
    const serverRoot = resolveServerRoot();
    const migrateOutput = await runMigrate(serverRoot);
    const seedOutput = await runSeed(serverRoot);
    return {
      ok: true as const,
      message:
        'Database migrated and seeded. Demo login: admin@chowsmart.app / Admin123!',
      migrateOutput: migrateOutput || 'No pending migrations.',
      seedOutput,
    };
  });
}
