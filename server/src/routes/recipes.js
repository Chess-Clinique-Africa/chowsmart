import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { cuisine, bread } = req.query;
    const params = [];
    const clauses = [];

    if (cuisine) {
      params.push(cuisine);
      clauses.push(`cuisine ILIKE $${params.length}`);
    }
    if (bread) {
      params.push(bread);
      clauses.push(`bread_slug = $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT id, slug, title, cuisine, region, difficulty, minutes, summary, bread_slug
       FROM recipes ${where}
       ORDER BY title`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM recipes WHERE slug = $1 LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Recipe not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
