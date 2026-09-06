-- ChowSmart schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS breads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  number SMALLINT NOT NULL,
  eyebrow TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  allergens TEXT[] NOT NULL DEFAULT '{}',
  image_prompt TEXT,
  portion_note TEXT,
  prep_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bread_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bread_id UUID NOT NULL REFERENCES breads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount_g NUMERIC(10, 1) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bread_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bread_id UUID NOT NULL REFERENCES breads(id) ON DELETE CASCADE,
  step_number SMALLINT NOT NULL,
  instruction TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bread_nutrition (
  bread_id UUID PRIMARY KEY REFERENCES breads(id) ON DELETE CASCADE,
  energy_kcal NUMERIC(8, 1),
  protein_g NUMERIC(8, 1),
  carbs_g NUMERIC(8, 1),
  fat_g NUMERIC(8, 1),
  fibre_g NUMERIC(8, 1),
  salt_g NUMERIC(8, 2),
  per_note TEXT DEFAULT 'Per modelled 70 g portion'
);

CREATE TABLE IF NOT EXISTS bread_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bread_id UUID NOT NULL REFERENCES breads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cuisine TEXT,
  description TEXT NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  cuisine TEXT NOT NULL,
  price_band TEXT NOT NULL CHECK (price_band IN ('₦', '₦₦', '₦₦₦')),
  rating NUMERIC(2, 1) NOT NULL DEFAULT 4.5,
  summary TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  region TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  minutes INTEGER NOT NULL,
  summary TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  bread_slug TEXT REFERENCES breads(slug) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  occasion TEXT,
  guest_count INTEGER,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breads_slug ON breads(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
