import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  MapPin,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { recipesService } from '@/services/recipes';
import { restaurantsService } from '@/services/restaurants';
import type { Recipe, Restaurant } from '@/types';

const SAVED_KEY = 'chowsmart-discover-saved';

const LOOKING_FOR = [
  { value: '', label: 'Anything' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'lunch', label: 'A proper lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'dessert', label: 'Something sweet' },
];

const PREFERENCES = [
  { value: '', label: 'No preference' },
  { value: 'plant-based', label: 'Plant-based' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'high-protein', label: 'High protein' },
  { value: 'gluten-free', label: 'Gluten-free' },
];

const MOODS = [
  { value: '', label: 'Surprise me' },
  { value: 'comforting', label: 'Comforting' },
  { value: 'light', label: 'Light & fresh' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'sweet', label: 'A little sweet' },
];

const CATEGORY_FILTERS = ['All meals', 'Breakfast', 'Brunch', 'Dessert'] as const;

type MealCategory = 'BREAKFAST' | 'BRUNCH' | 'LUNCH' | 'DINNER' | 'DESSERT';
type CardTone = 'orange' | 'green' | 'yellow';

interface MealIdea {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: MealCategory;
  tag: string;
  image: string;
  tone: CardTone;
  dietaryTags: string[];
  allergens: string[];
  cuisine?: string;
  href: string;
}

const PRINCIPLES = [
  {
    n: '01',
    title: 'Personal starts with you',
    body: 'Your tastes lead the way. Our vision is AI that helps you discover meals that fit.',
  },
  {
    n: '02',
    title: 'Local food, everyday ease',
    body: 'Connecting professionals with food and restaurant partners, beginning in Lagos.',
  },
  {
    n: '03',
    title: 'Thoughtful beyond the plate',
    body: 'Exploring better packaging, less food waste and more sustainable food habits.',
  },
];

function loadSaved(): string[] {
  try {
    const raw = sessionStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function inferCategory(recipe: Recipe): MealCategory {
  const blob = `${recipe.name} ${recipe.description} ${recipe.dietaryTags.join(' ')}`.toLowerCase();
  if (/dessert|parfait|yoghurt|yogurt|tiramisu|cheesecake|baklava|sweet|chocolate|honey|ice cream/.test(blob)) {
    return 'DESSERT';
  }
  if (/breakfast|akara|pap|oat|toast|scramble|morning/.test(blob)) return 'BREAKFAST';
  if (/brunch|plantain|ewa|beans|jollof|shawarma/.test(blob)) return 'BRUNCH';
  if (/soup|stew|egusi|dinner|suya|biryani|pizza|pasta|ramen/.test(blob)) return 'DINNER';
  if ((recipe.prepTime || 0) + (recipe.cookTime || 0) <= 25) return 'LUNCH';
  return 'BRUNCH';
}

function mealTag(recipe: Recipe): string {
  const tags = recipe.dietaryTags || [];
  if (tags.includes('vegan') || tags.includes('plant-based')) return 'Plant-based';
  if (tags.includes('vegetarian')) return 'Vegetarian';
  if (recipe.cuisine?.slug === 'nigerian' || recipe.cuisine?.name?.toLowerCase() === 'nigerian') {
    return 'Nigerian favourite';
  }
  if (tags.includes('high-protein')) return 'High protein';
  if (recipe.cuisine?.name) return recipe.cuisine.name;
  return 'From the collection';
}

function toneFor(index: number, category: MealCategory): CardTone {
  if (category === 'DESSERT') return 'yellow';
  const cycle: CardTone[] = ['orange', 'green', 'orange', 'yellow', 'green', 'yellow'];
  return cycle[index % cycle.length];
}

function friendlyTitle(recipe: Recipe, category: MealCategory): string {
  const name = recipe.name;
  if (/jollof/i.test(name)) return 'The jollof break';
  if (/suya/i.test(name)) return 'Street heat, plated';
  if (/egusi/i.test(name)) return 'A bowl worth slowing for';
  if (/plantain|ewa|beans/i.test(name)) return 'Plantain, meet beans';
  if (/shawarma/i.test(name)) return 'Wrap it up';
  if (/pizza/i.test(name)) return 'Weeknight Italian';
  if (/pasta/i.test(name)) return 'Garlic, butter, done';
  if (/yam|pounded/i.test(name)) return 'Classic swallow energy';
  if (category === 'BREAKFAST') return `Morning · ${name.split(' ').slice(0, 3).join(' ')}`;
  if (category === 'DESSERT') return 'The sweet pause';
  return name;
}

function recipeToMeal(recipe: Recipe, index: number): MealIdea {
  const category = inferCategory(recipe);
  return {
    id: recipe.id,
    slug: recipe.slug,
    title: friendlyTitle(recipe, category),
    subtitle: recipe.name,
    category,
    tag: mealTag(recipe),
    image: recipe.image,
    tone: toneFor(index, category),
    dietaryTags: recipe.dietaryTags || [],
    allergens: recipe.allergens || [],
    cuisine: recipe.cuisine?.slug,
    href: `/recipes/${recipe.slug}`,
  };
}

function matchesLookingFor(meal: MealIdea, looking: string) {
  if (!looking) return true;
  if (looking === 'breakfast') return meal.category === 'BREAKFAST';
  if (looking === 'brunch') return meal.category === 'BRUNCH' || meal.category === 'BREAKFAST';
  if (looking === 'dessert') return meal.category === 'DESSERT';
  if (looking === 'lunch') return meal.category === 'LUNCH' || meal.category === 'BRUNCH';
  if (looking === 'dinner') return meal.category === 'DINNER' || meal.category === 'BRUNCH';
  return true;
}

function matchesPreference(meal: MealIdea, preference: string) {
  if (!preference) return true;
  if (preference === 'plant-based') {
    return (
      meal.dietaryTags.includes('vegan') ||
      meal.dietaryTags.includes('plant-based') ||
      (meal.dietaryTags.includes('dairy-free') && meal.tag === 'Plant-based')
    );
  }
  if (preference === 'vegetarian') {
    return (
      meal.dietaryTags.includes('vegetarian') ||
      meal.dietaryTags.includes('vegan') ||
      meal.tag === 'Vegetarian' ||
      meal.tag === 'Plant-based'
    );
  }
  return meal.dietaryTags.includes(preference);
}

function matchesMood(meal: MealIdea, mood: string) {
  if (!mood) return true;
  const blob = `${meal.title} ${meal.subtitle} ${meal.tag}`.toLowerCase();
  if (mood === 'spicy') return /suya|pepper|chilli|spicy|yaji|arrabbiata|jollof/.test(blob);
  if (mood === 'sweet') return meal.category === 'DESSERT' || /honey|chocolate|sweet|fruit|yoghurt/.test(blob);
  if (mood === 'light') return /salad|fruit|greens|oat|toast|fresh|plant-based|vegetarian/.test(blob);
  if (mood === 'comforting') return /jollof|soup|stew|egusi|yam|pasta|pizza|beans|brunch/.test(blob);
  return true;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function OurStory() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [preference, setPreference] = useState('');
  const [mood, setMood] = useState('');
  const [matched, setMatched] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>('All meals');
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>(() => loadSaved());
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [recipePage, restaurantPage] = await Promise.all([
          recipesService.list({ limit: 24, featured: undefined }),
          restaurantsService.list({ limit: 6, city: 'Lagos' }),
        ]);
        if (cancelled) return;
        setRecipes(recipePage.items);
        setRestaurants(restaurantPage.items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load meals');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  const meals = useMemo(() => recipes.map(recipeToMeal), [recipes]);

  const visible = useMemo(() => {
    let list = meals.filter((m) => {
      if (matched) {
        if (!matchesLookingFor(m, lookingFor)) return false;
        if (!matchesPreference(m, preference)) return false;
        if (!matchesMood(m, mood)) return false;
      }
      if (category === 'Breakfast') return m.category === 'BREAKFAST';
      if (category === 'Brunch') return m.category === 'BRUNCH' || m.category === 'LUNCH';
      if (category === 'Dessert') return m.category === 'DESSERT';
      return true;
    });
    if (savedOnly) list = list.filter((m) => saved.includes(m.id));
    return list;
  }, [meals, matched, lookingFor, preference, mood, category, savedOnly, saved]);

  const active = meals.find((m) => m.id === activeId) || null;

  function onFindMeals(e: FormEvent) {
    e.preventDefault();
    setMatched(true);
    setCategory('All meals');
    setSavedOnly(false);
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleSave(id: string) {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function clearMatch() {
    setMatched(false);
    setLookingFor('');
    setPreference('');
    setMood('');
  }

  return (
    <div className="disc-app">
      <div className="disc-main">
        <section className="intro">
          <div className="intro-copy">
            <div className="eyebrow">
              <span className="tiny-line" /> MADE FOR YOUR EVERYDAY
            </div>
            <h1>
              Good food.
              <br />
              Your kind of <em>smart.</em>
            </h1>
            <p>
              Less “what should I eat?”
              <br />
              More meals that feel like you.
            </p>
            <div className="location">
              <MapPin size={16} aria-hidden /> Starting with Lagos · Product preview
            </div>
          </div>
          <div className="hero-photo">
            <img
              src="/food-spread.webp"
              alt="Illustrative Nigerian brunch spread with jollof rice, grilled chicken, plantain and fresh vegetables"
            />
            <span className="photo-label">LOCAL FLAVOUR. PERSONAL TASTE.</span>
            <div className="photo-caption">
              <span>
                Made for busy days.
                <br />
                <b>And very good breaks.</b>
              </span>
              <Utensils size={28} aria-hidden />
            </div>
          </div>
        </section>

        <section className="matcher" aria-labelledby="matcher-title">
          <div className="matcher-heading">
            <span className="spark">
              <Sparkles size={23} aria-hidden />
            </span>
            <div>
              <h2 id="matcher-title">What sounds good today?</h2>
              <p>Tell us a little. Find your next favourite.</p>
            </div>
            <span className="preview-badge">SMART MATCH · DEMO</span>
          </div>
          <form className="match-controls" onSubmit={onFindMeals}>
            <label className="choice">
              <span>I&apos;m looking for</span>
              <select
                aria-label="I'm looking for"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
              >
                {LOOKING_FOR.map((o) => (
                  <option key={o.value || 'any'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="choice">
              <span>My food preference</span>
              <select
                aria-label="My food preference"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
              >
                {PREFERENCES.map((o) => (
                  <option key={o.value || 'none'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="choice">
              <span>I&apos;m in the mood for</span>
              <select aria-label="I'm in the mood for" value={mood} onChange={(e) => setMood(e.target.value)}>
                {MOODS.map((o) => (
                  <option key={o.value || 'surprise'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary" type="submit">
              <Sparkles size={17} aria-hidden /> Find my meals <ArrowRight size={18} aria-hidden />
            </button>
          </form>
          <p className="demo-note">
            Explore meals from the ChowSmart recipe collection with preference-based matching. Live AI
            recommendations and ordering are coming next.
          </p>
        </section>

        <section className="discovery" id="discover">
          <div className="section-top">
            <div>
              <div className="eyebrow">A LITTLE INSPIRATION</div>
              <h2>Your next good food moment</h2>
            </div>
            <button
              type="button"
              className={`save-filter${savedOnly ? ' active' : ''}`}
              onClick={() => setSavedOnly((v) => !v)}
            >
              <Heart size={17} aria-hidden /> Saved ideas ({saved.length})
            </button>
          </div>

          {matched ? (
            <div className="match-summary">
              <span>
                Showing {visible.length} match{visible.length === 1 ? '' : 'es'} from the database
                {lookingFor ? ` · ${LOOKING_FOR.find((o) => o.value === lookingFor)?.label}` : ''}
                {preference ? ` · ${PREFERENCES.find((o) => o.value === preference)?.label}` : ''}
                {mood ? ` · ${MOODS.find((o) => o.value === mood)?.label}` : ''}
              </span>
              <button type="button" onClick={clearMatch}>
                Clear filters
              </button>
            </div>
          ) : null}

          <div className="filter-line">
            <div className="filters" aria-label="Meal category">
              {CATEGORY_FILTERS.map((label) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={category === label}
                  className={category === label ? 'active' : ''}
                  onClick={() => setCategory(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <span>From your collection · Not available to order</span>
          </div>

          {error ? <p className="demo-note">{error}</p> : null}

          {loading ? (
            <div className="empty">
              <h3>Loading meal ideas…</h3>
              <p>Pulling recipes from the database.</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <h3>No matches just yet</h3>
              <p>Try another preference, clear saved-only, or browse all meals.</p>
              <button type="button" className="primary" onClick={clearMatch}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="meal-grid">
              {visible.map((meal, index) => (
                <article key={meal.id} className={`meal-card ${meal.tone}`}>
                  <div className="meal-card-top">
                    <span className="meal-number">
                      {pad(index + 1)} / {meal.category}
                    </span>
                    <button
                      type="button"
                      aria-label={`Save ${meal.title}`}
                      aria-pressed={saved.includes(meal.id)}
                      onClick={() => toggleSave(meal.id)}
                    >
                      <Heart size={19} aria-hidden fill={saved.includes(meal.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <figure className="menu-visual">
                    <img
                      src={meal.image}
                      alt={`${meal.subtitle} — illustrative serving idea`}
                      loading="lazy"
                      decoding="async"
                      width={768}
                      height={512}
                    />
                    <figcaption>
                      {meal.subtitle}
                      <small>AI illustration · serving may vary</small>
                    </figcaption>
                  </figure>
                  <h3>{meal.title}</h3>
                  <p>{meal.subtitle}</p>
                  <div className="meal-bottom">
                    <span>{meal.tag}</span>
                    <button
                      type="button"
                      aria-label={`View ${meal.title}`}
                      onClick={() => setActiveId(meal.id)}
                    >
                      <ArrowUpRight size={23} aria-hidden />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {active ? (
            <div className="meal-detail">
              <h3>{active.title}</h3>
              <p>{active.subtitle}</p>
              <p>
                Category: {active.category.toLowerCase()} · {active.tag}
                {active.allergens.length ? ` · Allergens: ${active.allergens.join(', ')}` : ''}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                <Link className="primary" to={active.href} style={{ display: 'inline-flex', textDecoration: 'none' }}>
                  Open recipe <ArrowRight size={16} aria-hidden />
                </Link>
                <button type="button" className="save-filter" onClick={() => setActiveId(null)}>
                  Close
                </button>
              </div>
            </div>
          ) : null}

          <p className="menu-footnote">
            Meal concepts and imagery are illustrative. Recipes and allergen details require vendor
            confirmation. Saved ideas last for this visit.
            {restaurants.length
              ? ` ${restaurants.length} Lagos restaurant${restaurants.length === 1 ? '' : 's'} are also live in the directory.`
              : ''}
          </p>
        </section>

        <section className="story" id="story">
          <div>
            <div className="eyebrow">FOOD THAT GETS YOU</div>
            <h2>
              Your schedule is busy.
              <br />
              Your meals can be simple.
            </h2>
            <p>
              ChowSmart by Products and Consumers Technologies Limited is rethinking food discovery
              around your tastes, routines and preferences. Built on our Breakfastly concept, we’re
              starting with the everyday needs of professionals in Lagos.
            </p>
            <a
              href="https://ng.linkedin.com/company/pctl-foods"
              target="_blank"
              rel="noreferrer"
            >
              Meet ChowSmart on LinkedIn <ArrowUpRight size={17} aria-hidden />
            </a>
          </div>
          <div className="principles">
            {PRINCIPLES.map((item) => (
              <div key={item.n}>
                <span>{item.n}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="partner" id="partners">
          <div>
            <span className="eyebrow">LET’S BUILD THE NEXT CHAPTER</span>
            <h2>
              A seat at the table.
              <br />A say in what’s next.
            </h2>
            <p>
              Food lover, workplace team or restaurant partner?
              <br />
              Help shape a more personal food experience.
            </p>
          </div>
          <div className="partner-action">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScqBmkaiB8tDj41H0C8E_BT-F21UrNz1-z7TYDaCv10-n-i5g/viewform?usp=sharing&ouid=102978989765514615300"
              target="_blank"
              rel="noreferrer"
              className="primary"
            >
              Take the PCTL survey <ArrowUpRight size={20} aria-hidden />
            </a>
            <a href="https://ng.linkedin.com/company/pctl-foods" target="_blank" rel="noreferrer">
              Connect with the team <ArrowUpRight size={17} aria-hidden />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
