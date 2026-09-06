import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDb, query } from './db.js';
import breadsRouter from './routes/breads.js';
import restaurantsRouter from './routes/restaurants.js';
import recipesRouter from './routes/recipes.js';
import menusRouter from './routes/menus.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1 AS ok');
    res.json({ ok: true, service: 'chowsmart-api' });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.use('/api/breads', breadsRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/menus', menusRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

await ensureDb();

app.listen(port, () => {
  console.log(`ChowSmart API listening on http://localhost:${port}`);
});
