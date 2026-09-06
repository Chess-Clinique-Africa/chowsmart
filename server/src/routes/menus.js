import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/suggest', async (req, res, next) => {
  try {
    const occasion = (req.query.occasion || 'dinner').toString().toLowerCase();
    const guests = Number(req.query.guests) || 4;

    const [breads, recipes, restaurants] = await Promise.all([
      query(`SELECT slug, name, short_name, tagline FROM breads ORDER BY number`),
      query(
        `SELECT slug, title, cuisine, minutes, bread_slug, summary
         FROM recipes ORDER BY random() LIMIT 3`
      ),
      query(
        `SELECT slug, name, city, cuisine FROM restaurants ORDER BY random() LIMIT 2`
      ),
    ]);

    const breadPick =
      occasion.includes('brunch') || occasion.includes('breakfast')
        ? breads.rows.find((b) => b.slug.includes('honey') || b.slug.includes('coconut')) ||
          breads.rows[0]
        : occasion.includes('dessert') || occasion.includes('sweet')
          ? breads.rows.find((b) => b.slug.includes('chocolate')) || breads.rows[0]
          : breads.rows[0];

    res.json({
      title: `${occasion} for ${guests}`,
      occasion,
      guest_count: guests,
      bread: breadPick,
      recipes: recipes.rows,
      restaurants: restaurants.rows,
      notes:
        'AI-assisted suggestion based on ChowSmart catalogue. Validate recipes in the kitchen before service.',
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, title, occasion, guest_count, notes, items, created_at
       FROM menu_plans
       ORDER BY created_at DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, occasion, guest_count, notes, items } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title is required' });
    }

    const safeItems = Array.isArray(items) ? items : [];
    const { rows } = await query(
      `INSERT INTO menu_plans (title, occasion, guest_count, notes, items)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [
        title.trim(),
        occasion || null,
        guest_count ? Number(guest_count) : null,
        notes || null,
        JSON.stringify(safeItems),
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
