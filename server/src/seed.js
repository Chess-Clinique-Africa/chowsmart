import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDb, exec, pool, query } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const breads = [
  {
    slug: 'wheat-baguette',
    number: 1,
    eyebrow: 'The everyday classic',
    name: 'Wheat Baguette Bread',
    short_name: 'Wheat',
    tagline: 'A crusty everyday baguette. Proposed 30% wholemeal formula.',
    description:
      'Flour-dusted, golden-brown baguettes with a crisp-looking crust and diagonal scores — the everyday ChowSmart loaf.',
    allergens: ['Wheat / gluten'],
    portion_note: 'Approx. 70 g each',
    prep_minutes: 180,
    ingredients: [
      { name: 'Flour, wheat, bread/strong, white', amount_g: 140.0 },
      { name: 'Flour, wheat, wholemeal, bread/strong', amount_g: 60.0 },
      { name: 'Water', amount_g: 136.0 },
      { name: 'Yeast, dried', amount_g: 2.0 },
      { name: 'Salt', amount_g: 3.0 },
    ],
    steps: [
      'Mix the flours, water and yeast. Add salt and knead until elastic.',
      'Cover and ferment for about 60–90 minutes, until visibly expanded. Timing depends on dough temperature.',
      'Divide into baguettes; shape and proof for about 35–50 minutes. Score the surface.',
      'Bake in a preheated oven at 220°C for about 22–28 minutes. Check the centre is fully baked; cool on a rack. Weigh the cooled batch.',
    ],
    nutrition: {
      energy_kcal: 185,
      protein_g: 6.2,
      carbs_g: 35.4,
      fat_g: 1.1,
      fibre_g: 2.8,
      salt_g: 0.72,
    },
    pairings: [
      {
        title: 'Suya-spiced chicken wraps',
        cuisine: 'Nigerian',
        description: 'Thin baguette slices with suya dust, yoghurt and cucumber.',
      },
      {
        title: 'Tomato stew dipping boards',
        cuisine: 'West African',
        description: 'Tear-and-share with smoked fish stew and soft-boiled eggs.',
      },
      {
        title: 'Herb butter & roast pepper',
        cuisine: 'Mediterranean',
        description: 'Warm baguette with whipped herb butter and charred peppers.',
      },
    ],
  },
  {
    slug: 'wrapped-baguette',
    number: 2,
    eyebrow: 'Ready to take along',
    name: 'Wrapped Baguette Bread',
    short_name: 'Wrapped',
    tagline: 'A takeaway baguette in a sealed dark wrapper with a kraft band.',
    description:
      'The portable ChowSmart baguette — same crust, packaged for on-the-go meals and market stalls.',
    allergens: ['Wheat / gluten'],
    portion_note: 'Approx. 70 g each',
    prep_minutes: 180,
    ingredients: [
      { name: 'Flour, wheat, bread/strong, white', amount_g: 150.0 },
      { name: 'Flour, wheat, wholemeal, bread/strong', amount_g: 50.0 },
      { name: 'Water', amount_g: 132.0 },
      { name: 'Yeast, dried', amount_g: 2.0 },
      { name: 'Salt', amount_g: 3.0 },
      { name: 'Olive oil', amount_g: 4.0 },
    ],
    steps: [
      'Combine flours, water, yeast and oil; knead until smooth, then add salt.',
      'Bulk ferment 60–75 minutes until airy.',
      'Shape into compact baguettes, proof 30–45 minutes, score lightly.',
      'Bake at 215°C for 20–26 minutes. Cool fully before wrapping.',
    ],
    nutrition: {
      energy_kcal: 192,
      protein_g: 6.0,
      carbs_g: 36.1,
      fat_g: 1.8,
      fibre_g: 2.4,
      salt_g: 0.7,
    },
    pairings: [
      {
        title: 'Agege-style egg sandwich',
        cuisine: 'Nigerian',
        description: 'Wrapped baguette filled with fried egg, onion and pepper sauce.',
      },
      {
        title: 'Smoked turkey picnic roll',
        cuisine: 'Afro-fusion',
        description: 'Sliced turkey, greens and chilli mayo for the road.',
      },
    ],
  },
  {
    slug: 'honey-creamed',
    number: 3,
    eyebrow: 'A golden centre',
    name: 'Honey-Creamed Bread',
    short_name: 'Honey',
    tagline: 'A scored golden loaf with a pale cream ring and glossy honey centre.',
    description:
      'Soft enriched dough with a honey-cream swirl — designed for breakfast tables and dessert boards.',
    allergens: ['Wheat / gluten', 'Milk', 'Egg'],
    portion_note: 'Approx. 80 g each',
    prep_minutes: 210,
    ingredients: [
      { name: 'Flour, wheat, bread/strong, white', amount_g: 180.0 },
      { name: 'Milk', amount_g: 90.0 },
      { name: 'Egg', amount_g: 50.0 },
      { name: 'Butter', amount_g: 25.0 },
      { name: 'Honey', amount_g: 40.0 },
      { name: 'Yeast, dried', amount_g: 3.0 },
      { name: 'Salt', amount_g: 2.5 },
      { name: 'Cream cheese filling', amount_g: 60.0 },
    ],
    steps: [
      'Warm milk slightly; dissolve yeast with a spoon of honey.',
      'Mix flour, egg, butter, remaining honey and salt; knead until silky.',
      'Ferment 75–90 minutes. Roll flat, spread cream filling and honey, roll and score.',
      'Proof 40–55 minutes. Bake at 180°C for 28–35 minutes until golden.',
    ],
    nutrition: {
      energy_kcal: 248,
      protein_g: 6.8,
      carbs_g: 34.2,
      fat_g: 9.4,
      fibre_g: 1.2,
      salt_g: 0.55,
    },
    pairings: [
      {
        title: 'Akara brunch board',
        cuisine: 'Nigerian',
        description: 'Honey bread with bean cakes, avocado and chilli oil.',
      },
      {
        title: 'Yoghurt & citrus',
        cuisine: 'Cafe',
        description: 'Thick yoghurt, orange segments and toasted pistachios.',
      },
    ],
  },
  {
    slug: 'chocolate-creamed',
    number: 4,
    eyebrow: 'Rich & chocolate filled',
    name: 'Chocolate-Creamed Bread',
    short_name: 'Chocolate',
    tagline: 'A sliced loaf with a thick glossy chocolate centre and chocolate flakes.',
    description:
      'Enriched chocolate dough with a dark cream core — the celebration loaf of the ChowSmart range.',
    allergens: ['Wheat / gluten', 'Milk', 'Egg', 'Soy'],
    portion_note: 'Approx. 80 g each',
    prep_minutes: 220,
    ingredients: [
      { name: 'Flour, wheat, bread/strong, white', amount_g: 170.0 },
      { name: 'Cocoa powder', amount_g: 18.0 },
      { name: 'Milk', amount_g: 95.0 },
      { name: 'Egg', amount_g: 50.0 },
      { name: 'Butter', amount_g: 30.0 },
      { name: 'Sugar', amount_g: 35.0 },
      { name: 'Yeast, dried', amount_g: 3.0 },
      { name: 'Salt', amount_g: 2.0 },
      { name: 'Chocolate cream filling', amount_g: 80.0 },
    ],
    steps: [
      'Bloom yeast in warm milk. Whisk flour with cocoa and sugar.',
      'Knead with egg, butter and salt until elastic and dark.',
      'Ferment 80–100 minutes. Fill with chocolate cream, shape and score.',
      'Proof 45–60 minutes. Bake at 175°C for 30–38 minutes. Cool before slicing.',
    ],
    nutrition: {
      energy_kcal: 276,
      protein_g: 7.1,
      carbs_g: 35.8,
      fat_g: 12.2,
      fibre_g: 2.6,
      salt_g: 0.48,
    },
    pairings: [
      {
        title: 'Plantain & cocoa dust',
        cuisine: 'Afro-fusion',
        description: 'Warm slices with caramelised plantain and cocoa nibs.',
      },
      {
        title: 'Espresso tasting',
        cuisine: 'Cafe',
        description: 'Serve thin slices with strong Nigerian coffee.',
      },
    ],
  },
  {
    slug: 'coconut-creamed',
    number: 5,
    eyebrow: 'A creamy coconut swirl',
    name: 'Coconut-Creamed Bread',
    short_name: 'Coconut',
    tagline: 'A golden loaf topped with toasted coconut and a pale cream swirl.',
    description:
      'Tropical-leaning ChowSmart loaf with coconut cream throughout and toasted coconut on the crust.',
    allergens: ['Wheat / gluten', 'Milk', 'Egg', 'Coconut'],
    portion_note: 'Approx. 80 g each',
    prep_minutes: 210,
    ingredients: [
      { name: 'Flour, wheat, bread/strong, white', amount_g: 175.0 },
      { name: 'Coconut milk', amount_g: 100.0 },
      { name: 'Egg', amount_g: 50.0 },
      { name: 'Butter', amount_g: 20.0 },
      { name: 'Desiccated coconut', amount_g: 35.0 },
      { name: 'Sugar', amount_g: 28.0 },
      { name: 'Yeast, dried', amount_g: 3.0 },
      { name: 'Salt', amount_g: 2.5 },
      { name: 'Coconut cream filling', amount_g: 70.0 },
    ],
    steps: [
      'Warm coconut milk; activate yeast with a little sugar.',
      'Mix flour, egg, butter, coconut and salt; knead until soft and slightly sticky.',
      'Ferment 70–90 minutes. Spread coconut cream, roll, top with toasted coconut.',
      'Proof 40–50 minutes. Bake at 180°C for 28–34 minutes.',
    ],
    nutrition: {
      energy_kcal: 262,
      protein_g: 6.4,
      carbs_g: 32.5,
      fat_g: 12.8,
      fibre_g: 2.9,
      salt_g: 0.52,
    },
    pairings: [
      {
        title: 'Pepper soup side',
        cuisine: 'Nigerian',
        description: 'Unexpected but excellent with mild fish pepper soup.',
      },
      {
        title: 'Mango & lime yoghurt',
        cuisine: 'Cafe',
        description: 'Breakfast plate with ripe mango and lime zest.',
      },
    ],
  },
];

const restaurants = [
  {
    slug: 'lagos-hearth',
    name: 'Lagos Hearth',
    city: 'Lagos',
    country: 'Nigeria',
    cuisine: 'Contemporary Nigerian',
    price_band: '₦₦₦',
    rating: 4.8,
    summary: 'Wood-fired Nigerian classics with a ChowSmart bread service.',
    specialties: ['Ofada rice', 'Grilled seafood', 'Wheat baguette board'],
  },
  {
    slug: 'abuja-grain-house',
    name: 'Abuja Grain House',
    city: 'Abuja',
    country: 'Nigeria',
    cuisine: 'Bakery & cafe',
    price_band: '₦₦',
    rating: 4.6,
    summary: 'All five ChowSmart loaves baked daily with seasonal fillings.',
    specialties: ['Honey-creamed loaf', 'Suya wraps', 'Coffee tasting'],
  },
  {
    slug: 'port-harbour-table',
    name: 'Port Harbour Table',
    city: 'Port Harcourt',
    country: 'Nigeria',
    cuisine: 'Coastal Nigerian',
    price_band: '₦₦',
    rating: 4.5,
    summary: 'River prawns, palm-oil stews and tear-and-share baguettes.',
    specialties: ['Prawn stew', 'Wrapped baguette', 'Native salad'],
  },
  {
    slug: 'ibadan-yard',
    name: 'Ibadan Yard Kitchen',
    city: 'Ibadan',
    country: 'Nigeria',
    cuisine: 'Yoruba home cooking',
    price_band: '₦',
    rating: 4.7,
    summary: 'Courtyard dining with amala, gbegiri and soft enriched breads.',
    specialties: ['Amala', 'Ewedu', 'Coconut-creamed bread'],
  },
  {
    slug: 'kano-spice-room',
    name: 'Kano Spice Room',
    city: 'Kano',
    country: 'Nigeria',
    cuisine: 'Northern Nigerian',
    price_band: '₦₦',
    rating: 4.4,
    summary: 'Suya, kilishi and flatbreads with a ChowSmart wheat option.',
    specialties: ['Suya', 'Kilishi', 'Wheat baguette'],
  },
];

const recipes = [
  {
    slug: 'suya-baguette-board',
    title: 'Suya baguette board',
    cuisine: 'Nigerian',
    region: 'Northern',
    difficulty: 'easy',
    minutes: 35,
    summary: 'Shareable suya with warm ChowSmart wheat baguette and cooling yoghurt.',
    bread_slug: 'wheat-baguette',
    ingredients: [
      '400 g chicken or beef strips',
      '2 tbsp suya spice',
      '1 ChowSmart wheat baguette',
      '150 g thick yoghurt',
      'Cucumber & onion to serve',
    ],
    steps: [
      'Toss meat with suya spice and a little oil; rest 15 minutes.',
      'Grill or pan-sear until charred at the edges.',
      'Warm and slice the baguette; arrange with yoghurt and salad.',
    ],
  },
  {
    slug: 'honey-bread-akara-brunch',
    title: 'Honey bread & akara brunch',
    cuisine: 'Nigerian',
    region: 'South-West',
    difficulty: 'medium',
    minutes: 50,
    summary: 'Bean cakes beside honey-creamed bread for a weekend brunch spread.',
    bread_slug: 'honey-creamed',
    ingredients: [
      '2 cups peeled black-eyed peas',
      '1 small onion',
      'Scotch bonnet to taste',
      'Oil for frying',
      'Honey-creamed bread slices',
    ],
    steps: [
      'Blend peas with onion and pepper; season well.',
      'Fry spoonfuls until golden and crisp.',
      'Toast honey bread lightly and serve with chilli oil.',
    ],
  },
  {
    slug: 'coconut-bread-pepper-soup',
    title: 'Coconut bread with mild pepper soup',
    cuisine: 'Nigerian',
    region: 'South-South',
    difficulty: 'medium',
    minutes: 55,
    summary: 'Soft coconut loaf as a side to aromatic fish pepper soup.',
    bread_slug: 'coconut-creamed',
    ingredients: [
      '500 g firm fish',
      'Pepper soup spice blend',
      'Scent leaves',
      'Coconut-creamed bread',
    ],
    steps: [
      'Simmer fish with spices until fragrant and just cooked.',
      'Finish with scent leaves.',
      'Serve bowls with warm coconut bread for dipping.',
    ],
  },
  {
    slug: 'plantain-chocolate-toast',
    title: 'Plantain chocolate toast',
    cuisine: 'Afro-fusion',
    region: 'West Africa',
    difficulty: 'easy',
    minutes: 20,
    summary: 'Caramelised plantain on chocolate-creamed bread.',
    bread_slug: 'chocolate-creamed',
    ingredients: [
      '2 ripe plantains',
      'Butter for frying',
      'Chocolate-creamed bread',
      'Cocoa nibs',
    ],
    steps: [
      'Fry plantain slices in butter until caramelised.',
      'Toast bread slices; top with plantain and cocoa nibs.',
    ],
  },
];

async function ensureSchema() {
  const schemaPath = path.resolve(__dirname, '../sql/schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');
  // PGlite may not need/allow every extension statement
  sql = sql.replace(/CREATE EXTENSION IF NOT EXISTS "pgcrypto";\s*/i, '');
  await exec(sql);
}

async function seed() {
  console.log('Seeding ChowSmart database...');
  await ensureDb();
  await ensureSchema();

  await query('TRUNCATE bread_pairings, bread_nutrition, bread_steps, bread_ingredients, menu_plans, recipes, restaurants, breads CASCADE');

  for (const bread of breads) {
    const { rows } = await query(
      `INSERT INTO breads
        (slug, number, eyebrow, name, short_name, tagline, description, allergens, portion_note, prep_minutes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        bread.slug,
        bread.number,
        bread.eyebrow,
        bread.name,
        bread.short_name,
        bread.tagline,
        bread.description,
        bread.allergens,
        bread.portion_note,
        bread.prep_minutes,
      ]
    );
    const breadId = rows[0].id;

    for (let i = 0; i < bread.ingredients.length; i++) {
      const ing = bread.ingredients[i];
      await query(
        `INSERT INTO bread_ingredients (bread_id, name, amount_g, sort_order)
         VALUES ($1,$2,$3,$4)`,
        [breadId, ing.name, ing.amount_g, i]
      );
    }

    for (let i = 0; i < bread.steps.length; i++) {
      await query(
        `INSERT INTO bread_steps (bread_id, step_number, instruction)
         VALUES ($1,$2,$3)`,
        [breadId, i + 1, bread.steps[i]]
      );
    }

    await query(
      `INSERT INTO bread_nutrition
        (bread_id, energy_kcal, protein_g, carbs_g, fat_g, fibre_g, salt_g)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        breadId,
        bread.nutrition.energy_kcal,
        bread.nutrition.protein_g,
        bread.nutrition.carbs_g,
        bread.nutrition.fat_g,
        bread.nutrition.fibre_g,
        bread.nutrition.salt_g,
      ]
    );

    for (let i = 0; i < bread.pairings.length; i++) {
      const p = bread.pairings[i];
      await query(
        `INSERT INTO bread_pairings (bread_id, title, cuisine, description, sort_order)
         VALUES ($1,$2,$3,$4,$5)`,
        [breadId, p.title, p.cuisine, p.description, i]
      );
    }
  }

  for (const r of restaurants) {
    await query(
      `INSERT INTO restaurants
        (slug, name, city, country, cuisine, price_band, rating, summary, specialties)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        r.slug,
        r.name,
        r.city,
        r.country,
        r.cuisine,
        r.price_band,
        r.rating,
        r.summary,
        r.specialties,
      ]
    );
  }

  for (const recipe of recipes) {
    await query(
      `INSERT INTO recipes
        (slug, title, cuisine, region, difficulty, minutes, summary, ingredients, steps, bread_slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10)`,
      [
        recipe.slug,
        recipe.title,
        recipe.cuisine,
        recipe.region,
        recipe.difficulty,
        recipe.minutes,
        recipe.summary,
        JSON.stringify(recipe.ingredients),
        JSON.stringify(recipe.steps),
        recipe.bread_slug,
      ]
    );
  }

  console.log(`Seeded ${breads.length} breads, ${restaurants.length} restaurants, ${recipes.length} recipes.`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await ensureDb();
      if (pool?.end) await pool.end();
    } catch {
      // ignore shutdown errors
    }
  });
