import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const usePglite =
  process.env.USE_PGLITE === 'true' ||
  process.env.DATABASE_URL === 'pglite' ||
  !process.env.DATABASE_URL;

let pool;
let ready;

async function initPglite() {
  const { PGlite } = await import('@electric-sql/pglite');
  const dataDir = path.resolve(__dirname, '../data/pglite');
  fs.mkdirSync(dataDir, { recursive: true });
  const pglite = new PGlite(dataDir);

  const adapter = {
    async query(text, params = []) {
      return pglite.query(text, params);
    },
    async exec(text) {
      return pglite.exec(text);
    },
    async end() {
      await pglite.close();
    },
  };

  pool = adapter;
  console.log('Using embedded PostgreSQL (PGlite) at', dataDir);
  return adapter;
}

function initPg() {
  const { Pool } = pg;
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  pool = {
    query: (text, params) => pgPool.query(text, params),
    exec: async (text) => pgPool.query(text),
    end: () => pgPool.end(),
  };
  console.log('Using PostgreSQL via DATABASE_URL');
  return pool;
}

ready = usePglite ? initPglite() : Promise.resolve(initPg());

export async function query(text, params) {
  await ready;
  return pool.query(text, params);
}

export async function exec(text) {
  await ready;
  return pool.exec(text);
}

export { pool, ready };

export async function ensureDb() {
  await ready;
  return pool;
}
