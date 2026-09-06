import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

async function loadBreadDetail(slugOrId) {
  const { rows } = await query(
    `SELECT id, slug, number, eyebrow, name, short_name, tagline, description,
            allergens, portion_note, prep_minutes
     FROM breads
     WHERE slug = $1 OR id::text = $1
     LIMIT 1`,
    [slugOrId]
  );
  if (!rows[0]) return null;
  const bread = rows[0];

  const [ingredients, steps, nutrition, pairings] = await Promise.all([
    query(
      `SELECT name, amount_g FROM bread_ingredients
       WHERE bread_id = $1 ORDER BY sort_order`,
      [bread.id]
    ),
    query(
      `SELECT step_number, instruction FROM bread_steps
       WHERE bread_id = $1 ORDER BY step_number`,
      [bread.id]
    ),
    query(`SELECT * FROM bread_nutrition WHERE bread_id = $1`, [bread.id]),
    query(
      `SELECT title, cuisine, description FROM bread_pairings
       WHERE bread_id = $1 ORDER BY sort_order`,
      [bread.id]
    ),
  ]);

  return {
    ...bread,
    ingredients: ingredients.rows,
    steps: steps.rows,
    nutrition: nutrition.rows[0] || null,
    pairings: pairings.rows,
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, slug, number, eyebrow, name, short_name, tagline, description, allergens
       FROM breads ORDER BY number`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const bread = await loadBreadDetail(req.params.slug);
    if (!bread) return res.status(404).json({ error: 'Bread not found' });
    res.json(bread);
  } catch (err) {
    next(err);
  }
});

export default router;
