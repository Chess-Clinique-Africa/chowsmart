import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  Plus,
  Scale,
  Search,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { breadsService } from '@/services/breads';
import { recipesService } from '@/services/recipes';
import type { Bread, Recipe } from '@/types';

const DRAFT_KEY = 'chowsmart-kitchen-draft';

const STUDIO_IMAGES: Record<string, string> = {
  'wheat-baguette-bread': '/breads/wheat-studio.png',
  'wrapped-baguette-bread': '/breads/wrapped-studio.png',
  'honey-creamed-bread': '/breads/honey-studio.png',
  'chocolate-creamed-bread': '/breads/chocolate-studio.png',
  'coconut-creamed-bread': '/breads/coconut-studio.png',
};

const ALLERGENS = ['Wheat / gluten', 'Milk', 'Egg', 'Nuts', 'Soy', 'Coconut'] as const;

const DIETS = [
  { value: '', label: 'All preferences' },
  { value: 'plant-based', label: 'Plant-based' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'high-protein', label: 'High protein' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'dairy-free', label: 'Dairy-free' },
];

const CATEGORIES = [
  { value: '', label: 'All dishes' },
  { value: 'bread', label: 'Bread' },
  { value: 'main', label: 'Main' },
  { value: 'side', label: 'Side' },
  { value: 'combo', label: 'Combo' },
];

type TabId = 'catalogue' | 'lab' | 'planner' | 'sources';

interface DraftItem {
  key: string;
  kind: 'BREAD' | 'RECIPE';
  id: string;
  slug: string;
  name: string;
  calories: number | null;
  quantity: number;
}

interface CollectionCard {
  key: string;
  kind: 'BREAD' | 'RECIPE';
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  badge: string;
  categoryLabel: string;
  dishKind: 'bread' | 'main' | 'side' | 'combo';
  formula: string;
  calories: number | null;
  portionLabel: string;
  allergens: string[];
  dietaryTags: string[];
  region: string;
  bread?: Bread;
  recipe?: Recipe;
}

const PROMPTS = [
  'Compare wheat and honey bread per portion',
  'Calculate wheat bread for 40 portions',
  'Find plant-based Nigerian menu ideas',
];

function breadImage(bread: Bread) {
  return STUDIO_IMAGES[bread.slug] || bread.image;
}

function formulaFrom(tags: string[], allergens: string[]) {
  const joined = [...tags, ...allergens].join(' ').toLowerCase();
  if (tags.includes('vegan') || tags.includes('plant-based')) return 'Plant-based formula';
  if (/dairy|milk|egg|honey|cream/.test(joined) || tags.includes('vegetarian')) {
    return 'Vegetarian formula';
  }
  if (!allergens.length && (tags.includes('dairy-free') || tags.includes('gluten-free'))) {
    return 'Plant-based formula';
  }
  return 'Development formula';
}

function dishKindFromRecipe(recipe: Recipe): CollectionCard['dishKind'] {
  const blob = `${recipe.name} ${recipe.dietaryTags.join(' ')}`.toLowerCase();
  if (/side|salad|greens|yoghurt|yogurt|fruit|mango|plantain|moi moi|swallow|pounded/.test(blob)) {
    return 'side';
  }
  if (/combo|pairing|with tomato|egg &/.test(blob)) return 'combo';
  return 'main';
}

function portionGrams(note: string | null | undefined, fallback: number) {
  const match = note?.match(/(\d+)\s*g/i);
  return match ? Number(match[1]) : fallback;
}

function matchesAllergenAvoid(allergens: string[], avoided: string[]) {
  if (!avoided.length) return true;
  const blob = allergens.join(' ').toLowerCase();
  return !avoided.some((label) => {
    const key = label.toLowerCase();
    if (key.includes('gluten') || key.includes('wheat')) return /gluten|wheat/.test(blob);
    if (key.includes('milk')) return /milk|dairy|cream|butter|cheese/.test(blob);
    if (key.includes('egg')) return /egg/.test(blob);
    if (key.includes('nut')) return /nut|peanut|almond|cashew/.test(blob);
    if (key.includes('soy')) return /soy|soya/.test(blob);
    if (key.includes('coconut')) return /coconut/.test(blob);
    return blob.includes(key);
  });
}

function matchesDiet(card: CollectionCard, diet: string) {
  if (!diet) return true;
  if (diet === 'plant-based') {
    return (
      card.dietaryTags.includes('vegan') ||
      card.formula.toLowerCase().includes('plant-based') ||
      (card.dietaryTags.includes('dairy-free') &&
        !/egg|dairy|milk|fish|meat|chicken|beef/.test(card.allergens.join(' ').toLowerCase()))
    );
  }
  if (diet === 'vegetarian') {
    return (
      card.dietaryTags.includes('vegetarian') ||
      card.dietaryTags.includes('vegan') ||
      card.formula.toLowerCase().includes('vegetarian') ||
      card.formula.toLowerCase().includes('plant-based')
    );
  }
  return card.dietaryTags.includes(diet);
}

function loadDraft(): DraftItem[] {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DraftItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function shortBlurb(text: string) {
  const sentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  return sentence.length > 140 ? `${sentence.slice(0, 137)}…` : sentence;
}

function breadToCard(bread: Bread): CollectionCard {
  const allergens = bread.allergens || [];
  const formula = formulaFrom([], allergens);
  const grams = portionGrams(bread.portionNote, portionGrams(bread.nutrition?.perNote, 100));
  return {
    key: `bread-${bread.id}`,
    kind: 'BREAD',
    id: bread.id,
    slug: bread.slug,
    name: bread.name.startsWith('ChowSmart') ? bread.name : `ChowSmart ${bread.name}`,
    description: shortBlurb(bread.description),
    image: breadImage(bread),
    badge: 'PRODUCT CONCEPT',
    categoryLabel: `Bread · ${formula}`,
    dishKind: 'bread',
    formula,
    calories: bread.nutrition?.calories ?? null,
    portionLabel: `${grams} g / portion`,
    allergens,
    dietaryTags: [],
    region: 'bread',
    bread,
  };
}

function recipeToCard(recipe: Recipe): CollectionCard {
  const dishKind = dishKindFromRecipe(recipe);
  const formula = formulaFrom(recipe.dietaryTags || [], recipe.allergens || []);
  const category =
    dishKind === 'side' ? 'Side' : dishKind === 'combo' ? 'Combo' : 'Main';
  return {
    key: `recipe-${recipe.id}`,
    kind: 'RECIPE',
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    description: shortBlurb(recipe.description),
    image: recipe.image,
    badge: 'RECIPE ILLUSTRATION',
    categoryLabel: `${category} · ${formula}`,
    dishKind,
    formula,
    calories: recipe.calories,
    portionLabel: `${recipe.servings} serving${recipe.servings === 1 ? '' : 's'}`,
    allergens: recipe.allergens || [],
    dietaryTags: recipe.dietaryTags || [],
    region: recipe.cuisine?.slug || 'world',
    recipe,
  };
}

function agentReply(
  prompt: string,
  cards: CollectionCard[],
  breads: Bread[],
  recipes: Recipe[]
) {
  const q = prompt.toLowerCase();
  const wheat = breads.find((b) => /wheat/i.test(b.name));
  const honey = breads.find((b) => /honey/i.test(b.name));

  if (/compare/.test(q) && wheat && honey) {
    return [
      `${wheat.name}: ~${wheat.nutrition?.calories ?? '—'} kcal (${wheat.portionNote || 'modelled portion'}).`,
      `${honey.name}: ~${honey.nutrition?.calories ?? '—'} kcal (${honey.portionNote || 'modelled portion'}).`,
      'Honey loaf is enriched (milk/egg); wheat baguette stays simpler for savoury service.',
    ].join('\n');
  }

  if (/40|portion|calculate|scale/.test(q) && wheat) {
    const base = wheat.ingredients || [];
    if (!base.length) {
      return `Scale ${wheat.name} to 40 portions using the recipe lab — open the wheat bread and multiply ingredient grams by service size.`;
    }
    const factor = 40;
    const lines = base
      .slice(0, 5)
      .map((i) => `• ${i.ingredient}: ${(i.quantity * factor).toFixed(0)} ${i.unit}`);
    return [`Rough scale of ${wheat.name} × ${factor} (batch estimate):`, ...lines].join('\n');
  }

  if (/plant|nigerian|jollof|menu/.test(q)) {
    const picks = cards
      .filter(
        (c) =>
          (c.region === 'nigerian' || /jollof|yam|moi|ewa|waakye|egusi|plantain/i.test(c.name)) &&
          matchesDiet(c, 'plant-based')
      )
      .slice(0, 4);
    const fallback = recipes
      .filter((r) => r.cuisine?.slug === 'nigerian' || /jollof|yam|moi/i.test(r.name))
      .slice(0, 4);
    const names = (picks.length ? picks.map((p) => p.name) : fallback.map((r) => r.name)).join(
      '\n• '
    );
    return `Plant-leaning Nigerian ideas from the catalogue:\n• ${names || 'Add more Nigerian recipes to the collection.'}`;
  }

  const hits = cards
    .filter((c) => c.name.toLowerCase().includes(q.split(/\s+/).find((w) => w.length > 4) || ''))
    .slice(0, 3);
  if (hits.length) {
    return `From the catalogue:\n${hits.map((h) => `• ${h.name} — ~${h.calories ?? '—'} kcal`).join('\n')}`;
  }

  return `I can search the ${cards.length}-item catalogue, compare breads, and sketch portion maths. Try a prompt above or name a dish from the collection.`;
}

export function RecipeLab() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('catalogue');
  const [breads, setBreads] = useState<Bread[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diet, setDiet] = useState('');
  const [avoided, setAvoided] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [draft, setDraft] = useState<DraftItem[]>(() => loadDraft());
  const [draftOpen, setDraftOpen] = useState(false);
  const [selected, setSelected] = useState<CollectionCard | null>(null);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentAnswer, setAgentAnswer] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [breadPage, recipePage] = await Promise.all([
          breadsService.list({ limit: 50 }),
          recipesService.list({ limit: 50 }),
        ]);
        if (cancelled) return;
        setBreads(breadPage.items);
        setRecipes(recipePage.items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load kitchen collection');
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
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.cuisine?.slug) set.add(r.cuisine.slug);
    });
    set.add('bread');
    return Array.from(set).sort();
  }, [recipes]);

  const collection = useMemo(() => {
    const cards = [...breads.map(breadToCard), ...recipes.map(recipeToCard)];
    return cards.filter((card) => {
      if (!matchesAllergenAvoid(card.allergens, avoided)) return false;
      if (!matchesDiet(card, diet)) return false;
      if (category && card.dishKind !== category) return false;
      if (region) {
        const r = card.region.toLowerCase();
        if (region === 'nigeria') {
          if (!(r === 'nigerian' || r === 'nigeria' || card.kind === 'BREAD')) return false;
        } else if (r !== region) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${card.name} ${card.description} ${card.categoryLabel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [breads, recipes, avoided, diet, category, region, search]);

  function toggleAllergen(label: string) {
    setAvoided((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  }

  function addToDraft(card: CollectionCard) {
    setDraft((prev) => {
      const existing = prev.find((d) => d.key === card.key);
      if (existing) {
        return prev.map((d) =>
          d.key === card.key ? { ...d, quantity: d.quantity + 1 } : d
        );
      }
      return [
        ...prev,
        {
          key: card.key,
          kind: card.kind,
          id: card.id,
          slug: card.slug,
          name: card.name,
          calories: card.calories,
          quantity: 1,
        },
      ];
    });
    setDraftOpen(true);
  }

  function updateQty(key: string, quantity: number) {
    setDraft((prev) =>
      prev
        .map((d) => (d.key === key ? { ...d, quantity: Math.max(1, quantity) } : d))
        .filter((d) => d.quantity > 0)
    );
  }

  function removeDraft(key: string) {
    setDraft((prev) => prev.filter((d) => d.key !== key));
  }

  async function explore(card: CollectionCard) {
    setSelected(card);
    setTab('lab');
    if (card.kind === 'RECIPE' && !card.recipe?.ingredients?.length) {
      setDetailLoading(true);
      try {
        const full = await recipesService.getBySlug(card.slug);
        setSelected({ ...card, recipe: full });
      } catch {
        /* keep list card */
      } finally {
        setDetailLoading(false);
      }
    }
    if (card.kind === 'BREAD' && !card.bread?.ingredients?.length) {
      setDetailLoading(true);
      try {
        const full = await breadsService.getBySlug(card.slug);
        setSelected({ ...card, bread: full, image: breadImage(full) });
      } catch {
        /* keep list card */
      } finally {
        setDetailLoading(false);
      }
    }
  }

  function askAgent(text: string) {
    const prompt = text.trim();
    if (!prompt) return;
    setAgentPrompt(prompt);
    setAgentAnswer(agentReply(prompt, collection, breads, recipes));
  }

  function onAgentSubmit(e: FormEvent) {
    e.preventDefault();
    askAgent(agentPrompt);
  }

  function continueToStudio() {
    navigate('/menu-studio', { state: { kitchenDraft: draft } });
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'catalogue', label: 'Menu collection' },
    { id: 'lab', label: 'Recipe & nutrition lab' },
    { id: 'planner', label: 'Kitchen planner' },
    { id: 'sources', label: 'Product analysis' },
  ];

  return (
    <div className="k-app">
      <div className="k-main" id="k-work">
        <div className="k-heading">
          <div>
            <p className="k-kicker">NIGERIAN ROOTS. AFRICAN POSSIBILITIES.</p>
            <h1>
              Your menu. <em>A little smarter.</em>
            </h1>
            <p>Develop recipes, understand portions and plan your next service.</p>
          </div>
          <button type="button" className="k-button k-dark" onClick={() => setDraftOpen((o) => !o)}>
            <ClipboardList size={18} aria-hidden />
            Menu draft <span>{draft.length}</span>
          </button>
        </div>

        <div className="k-tabs">
          <div className="k-tablist" role="tablist" aria-label="Kitchen workspace">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="k-layout">
            <div className="k-workspace">
              {draftOpen ? (
                <div className="k-draft-panel">
                  <h3>Menu draft</h3>
                  {draft.length === 0 ? (
                    <p className="k-small" style={{ marginTop: 0 }}>
                      Add recipes from the collection with the + button.
                    </p>
                  ) : (
                    <ul>
                      {draft.map((item) => (
                        <li key={item.key}>
                          <span>
                            {item.name}
                            {item.calories != null ? ` · ~${item.calories} kcal` : ''}
                          </span>
                          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              className="k-count"
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateQty(item.key, Number(e.target.value) || 1)}
                              aria-label={`Quantity for ${item.name}`}
                            />
                            <button
                              type="button"
                              className="k-icon-button"
                              aria-label={`Remove ${item.name}`}
                              onClick={() => removeDraft(item.key)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="k-draft-actions">
                    <button
                      type="button"
                      className="k-button k-dark"
                      disabled={!draft.length}
                      onClick={continueToStudio}
                    >
                      Continue in Menu studio
                    </button>
                    <button type="button" className="k-text-button" onClick={() => setDraft([])}>
                      Clear draft
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="k-filter-box">
                <div className="k-filter-top">
                  <label className="k-pick">
                    <span>Dietary preference</span>
                    <select
                      aria-label="Dietary preference"
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                    >
                      {DIETS.map((d) => (
                        <option key={d.value || 'all'} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="k-allergens">
                    <span>Exclude declared / possible allergens</span>
                    <div>
                      {ALLERGENS.map((label) => (
                        <label key={label}>
                          <input
                            type="checkbox"
                            checked={avoided.includes(label)}
                            onChange={() => toggleAllergen(label)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <p>
                  Filters screen the proposed recipes only. Supplier ingredients and kitchen
                  cross-contact still need confirmation.
                </p>
              </div>

              {tab === 'catalogue' ? (
                <>
                  <div className="k-collection-top">
                    <div>
                      <p className="k-kicker">THE CHOWSMART COLLECTION</p>
                      <h2>Made for your next menu.</h2>
                    </div>
                    <span>
                      {loading ? '…' : collection.length} recipe
                      {collection.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="k-searchline">
                    <label className="k-search">
                      <Search size={18} aria-hidden />
                      <input
                        aria-label="Search recipes"
                        placeholder="Search bread, jollof, yam…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <label className="k-pick">
                      <span>Category</span>
                      <select
                        aria-label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value || 'all'} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="k-pick">
                      <span>Region</span>
                      <select
                        aria-label="Region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        <option value="">All regions</option>
                        {regions.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {error ? <p className="k-warning">{error}</p> : null}

                  {loading ? (
                    <div className="k-empty">
                      <h3>Loading collection…</h3>
                      <p>Pulling breads and recipes from the database.</p>
                    </div>
                  ) : collection.length === 0 ? (
                    <div className="k-empty">
                      <h3>No matches</h3>
                      <p>Try clearing filters or search terms.</p>
                    </div>
                  ) : (
                    <div className="k-cards">
                      {collection.map((card) => (
                        <article key={card.key} className="k-card">
                          <div className="k-food-img k-studio-image">
                            <img
                              src={card.image}
                              alt={`${card.name} — AI-generated recipe illustration`}
                              loading="lazy"
                              decoding="async"
                            />
                            <span>{card.badge}</span>
                          </div>
                          <div className="k-card-body">
                            <span className="k-card-category">{card.categoryLabel}</span>
                            <h3>{card.name}</h3>
                            <p>{card.description}</p>
                            <div className="k-card-nutrition">
                              <b>
                                ~{card.calories ?? '—'} <small>kcal</small>
                              </b>
                              <span>{card.portionLabel}</span>
                            </div>
                            <div className="k-card-actions">
                              <button type="button" onClick={() => void explore(card)}>
                                Explore recipe <ArrowRight size={16} aria-hidden />
                              </button>
                              <button
                                type="button"
                                aria-label={`Add ${card.name} to menu`}
                                onClick={() => addToDraft(card)}
                              >
                                <Plus size={20} aria-hidden />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  <p className="k-small">
                    Food images are AI-generated illustrations, not restaurant photographs or
                    measured portions. All recipes are development formulas. The five bread
                    concepts come from your supplied sheets; regional dishes are clearly labeled
                    adaptations.
                  </p>
                </>
              ) : null}

              {tab === 'lab' ? (
                <LabPanel
                  selected={selected}
                  loading={detailLoading}
                  onBack={() => setTab('catalogue')}
                  onAdd={() => selected && addToDraft(selected)}
                />
              ) : null}

              {tab === 'planner' ? (
                <div>
                  <div className="k-collection-top">
                    <div>
                      <p className="k-kicker">KITCHEN PLANNER</p>
                      <h2>Build the next service.</h2>
                    </div>
                  </div>
                  {draft.length === 0 ? (
                    <div className="k-empty">
                      <h3>Draft is empty</h3>
                      <p>Add items from the menu collection, then scale quantities here.</p>
                      <button
                        type="button"
                        className="k-button k-dark"
                        onClick={() => setTab('catalogue')}
                      >
                        Browse collection
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="k-saved">
                        {draft.map((item) => (
                          <button key={item.key} type="button" onClick={() => setTab('lab')}>
                            <span>
                              <b>{item.name}</b>
                              <small>
                                Qty {item.quantity}
                                {item.calories != null
                                  ? ` · ~${item.calories * item.quantity} kcal total`
                                  : ''}
                              </small>
                            </span>
                            <input
                              className="k-count"
                              type="number"
                              min={1}
                              value={item.quantity}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateQty(item.key, Number(e.target.value) || 1)}
                            />
                          </button>
                        ))}
                      </div>
                      <div className="k-planner-actions">
                        <button type="button" className="k-button k-dark" onClick={continueToStudio}>
                          Open in Menu studio
                        </button>
                        <button type="button" className="k-text-button" onClick={() => setDraft([])}>
                          Clear planner
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {tab === 'sources' ? (
                <div>
                  <div className="k-analysis-intro">
                    <div className="k-source-photo">
                      <img src="/breads/wheat-studio.png" alt="ChowSmart wheat baguette" />
                    </div>
                    <div>
                      <h3>Product analysis</h3>
                      <p>
                        Bread concepts and regional recipes in this lab are development formulas
                        linked to your database. Nutrition figures come from modelled portions —
                        never guessed from a photo.
                      </p>
                      <p>
                        Use the collection filters to screen allergens and diet tags, then open a
                        recipe in the lab for ingredients and method.
                      </p>
                      <Link className="k-text-button" to="/breads">
                        Open bread collection →
                      </Link>
                    </div>
                  </div>
                  <h3 className="k-subheading">In this database</h3>
                  <p>
                    {breads.length} bread concept{breads.length === 1 ? '' : 's'} and{' '}
                    {recipes.length} recipe{recipes.length === 1 ? '' : 's'} are available to the
                    kitchen workspace.
                  </p>
                </div>
              ) : null}
            </div>

            <aside className="k-agent">
              <div className="k-agent-title">
                <span>
                  <Sparkles size={21} aria-hidden />
                </span>
                <div>
                  <h2>ChowSmart Agent</h2>
                  <p>Your kitchen thinking partner</p>
                </div>
              </div>
              <div className={`k-agent-status ${breads.length || recipes.length ? 'ready' : ''}`}>
                <span>
                  {loading
                    ? 'Checking catalogue…'
                    : error
                      ? 'Catalogue offline — start the API'
                      : 'Catalogue ready'}
                </span>
              </div>
              <p>Ask about the catalogue, compare a bread recipe or calculate ingredients for service.</p>
              <div className="k-prompts">
                {PROMPTS.map((p) => (
                  <button key={p} type="button" onClick={() => askAgent(p)}>
                    {p}
                    <ArrowUpRight size={15} aria-hidden />
                  </button>
                ))}
              </div>
              {agentAnswer ? <div className="k-agent-reply">{agentAnswer}</div> : null}
              <form onSubmit={onAgentSubmit}>
                <label htmlFor="k-prompt">What are you preparing?</label>
                <textarea
                  id="k-prompt"
                  maxLength={2000}
                  placeholder="For example: plan a Nigerian breakfast with bread and a plant-based side…"
                  rows={4}
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                />
                <button className="k-button k-dark" type="submit" disabled={!agentPrompt.trim()}>
                  <Send size={17} aria-hidden /> Ask the agent
                </button>
              </form>
              <p className="k-small">
                Replies use the live catalogue from your database. Live LLM chat can be wired later;
                the recipe lab and planner work independently.
              </p>
              <div className="k-agent-tools">
                <h3>Tools behind the menu</h3>
                <p>
                  <Check size={15} aria-hidden /> Filtered recipe lookup
                </p>
                <p>
                  <Check size={15} aria-hidden /> Ingredient &amp; portion calculations
                </p>
                <p>
                  <Check size={15} aria-hidden /> Explicit allergen constraints
                </p>
                <p>
                  <Check size={15} aria-hidden /> Human-reviewed menu saving
                </p>
              </div>
              <div className="k-agent-foot">
                <Scale size={20} aria-hidden />
                <span>
                  Nutrition is calculated from recipes.
                  <br />
                  Never guessed from a photo.
                </span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabPanel({
  selected,
  loading,
  onBack,
  onAdd,
}: {
  selected: CollectionCard | null;
  loading: boolean;
  onBack: () => void;
  onAdd: () => void;
}) {
  if (!selected) {
    return (
      <div className="k-empty">
        <h3>Pick a recipe to explore</h3>
        <p>Open any card from the menu collection to see nutrition and method.</p>
        <button type="button" className="k-button k-dark" onClick={onBack}>
          Back to collection
        </button>
      </div>
    );
  }

  const bread = selected.bread;
  const recipe = selected.recipe;
  const ingredients =
    selected.kind === 'BREAD' ? bread?.ingredients || [] : recipe?.ingredients || [];
  const steps = selected.kind === 'RECIPE' ? recipe?.instructions || [] : [];

  return (
    <div className="k-lab-detail">
      <button type="button" className="k-text-button" onClick={onBack}>
        ← Back to collection
      </button>
      <div className="k-recipe-hero" style={{ marginTop: 16 }}>
        <div className="k-food-img k-studio-image">
          <img src={selected.image} alt={selected.name} />
        </div>
        <div>
          <span className="k-card-category">{selected.categoryLabel}</span>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          {selected.kind === 'BREAD' ? (
            <Link className="k-text-button" to={`/breads/${selected.slug}`}>
              Full bread page →
            </Link>
          ) : (
            <Link className="k-text-button" to={`/recipes/${selected.slug}`}>
              Full recipe page →
            </Link>
          )}
        </div>
      </div>

      {loading ? <p className="k-small">Loading detail…</p> : null}

      <div className="k-lab-nutrition">
        <div>
          <strong>~{selected.calories ?? '—'}</strong>
          <span>kcal</span>
        </div>
        {selected.kind === 'RECIPE' ? (
          <>
            <div>
              <strong>{recipe?.protein ?? '—'}</strong>
              <span>g protein</span>
            </div>
            <div>
              <strong>{recipe?.carbohydrates ?? '—'}</strong>
              <span>g carbs</span>
            </div>
          </>
        ) : (
          <>
            <div>
              <strong>{bread?.nutrition?.protein ?? '—'}</strong>
              <span>g protein</span>
            </div>
            <div>
              <strong>{bread?.nutrition?.carbohydrates ?? '—'}</strong>
              <span>g carbs</span>
            </div>
          </>
        )}
      </div>

      <div className="k-section-title">
        <h3>Ingredients</h3>
        <span>{selected.portionLabel}</span>
      </div>
      {ingredients.length ? (
        <div data-slot="table-container">
          <table data-slot="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Ingredient</th>
                <th align="left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((row) => (
                <tr key={row.id}>
                  <td>{'ingredient' in row ? row.ingredient : ''}</td>
                  <td>
                    {'quantity' in row
                      ? `${row.quantity}${row.unit ? ` ${row.unit}` : ''}`
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="k-small">No ingredient lines on this record yet.</p>
      )}

      {steps.length ? (
        <>
          <div className="k-section-title">
            <h3>Method</h3>
          </div>
          <ol className="k-method">
            {steps.map((step, i) => (
              <li key={`${i}-${step.slice(0, 12)}`}>
                <span>{i + 1}</span>
                <div>{step}</div>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      {selected.allergens.length ? (
        <div className="k-recipe-note">
          <b>Declared allergens</b>
          <p>{selected.allergens.join(' · ')}</p>
        </div>
      ) : null}

      <div className="k-planner-actions">
        <button type="button" className="k-button k-dark" onClick={onAdd}>
          <Plus size={16} aria-hidden /> Add to menu draft
        </button>
      </div>
    </div>
  );
}
