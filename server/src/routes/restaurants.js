import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { city, q } = req.query;
    const params = [];
    const clauses = [];

    if (city) {
      params.push(city);
      clauses.push(`city ILIKE $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      clauses.push(
        `(name ILIKE $${params.length} OR cuisine ILIKE $${params.length} OR summary ILIKE $${params.length})`
      );
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT id, slug, name, city, country, cuisine, price_band, rating, summary, specialties
       FROM restaurants ${where}
       ORDER BY rating DESC, name ASC`,
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
      `SELECT * FROM restaurants WHERE slug = $1 LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
