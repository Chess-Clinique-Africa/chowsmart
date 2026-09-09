import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUp,
  ArrowUpRight,
  Bookmark,
  Earth,
  Mic,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { TalkToChowSmartModal } from '@/components/TalkToChowSmartModal/TalkToChowSmartModal';
import { breadsService } from '@/services/breads';
import { menuPlansService } from '@/services/menuPlans';
import { recipesService } from '@/services/recipes';
import { restaurantsService } from '@/services/restaurants';
import { api, unwrap } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { chatBubble, easeOut, tabPanel } from '@/utils/motion';
import type { Bread, MenuPlan, Recipe } from '@/types';

const DESTINATIONS = [
  { label: 'Nigeria', cuisine: 'nigerian' },
  { label: 'Italy', cuisine: 'italian' },
  { label: 'China', cuisine: 'chinese' },
  { label: 'India', cuisine: 'indian' },
  { label: 'Mediterranean', cuisine: 'mediterranean' },
  { label: 'United States', cuisine: 'american' },
  { label: 'Africa', cuisine: 'african' },
  { label: 'Continental', cuisine: 'continental' },
];

const ALLERGENS = [
  'Wheat / gluten',
  'Milk',
  'Egg',
  'Peanuts',
  'Tree nuts',
  'Soy',
  'Sesame',
  'Fish',
  'Shellfish',
  'Coconut',
];

const LANGUAGES = [
  { value: 'en-US', label: 'English' },
  { value: 'fr-FR', label: 'French' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'pt-BR', label: 'Portuguese' },
  { value: 'ar-SA', label: 'Arabic' },
  { value: 'yo-NG', label: 'Yoruba' },
  { value: 'ha-NG', label: 'Hausa' },
  { value: 'ig-NG', label: 'Igbo' },
  { value: 'auto', label: 'Other / auto-detect' },
];

type StudioTab = 'create' | 'saved';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  planItems?: Array<{
    itemType: 'RECIPE' | 'BREAD' | 'MENU_ITEM';
    itemId: string;
    name: string;
    quantity: number;
    calories: number | null;
    price: number | null;
    notes?: string;
  }>;
  planTitle?: string;
}

function allergenKey(label: string) {
  return label.toLowerCase().replace(/\s+/g, ' ');
}

function recipeMatchesAvoid(recipe: Recipe, avoided: string[]) {
  if (!avoided.length) return true;
  const blob = [...recipe.allergens, ...(recipe.ingredients || []).map((i) => i.ingredient)]
    .join(' ')
    .toLowerCase();
  return !avoided.some((a) => {
    const key = allergenKey(a);
    if (key.includes('gluten') || key.includes('wheat')) return /gluten|wheat/.test(blob);
    if (key.includes('milk')) return /milk|dairy|cream|butter|cheese/.test(blob);
    if (key.includes('egg')) return /egg/.test(blob);
    if (key.includes('peanut')) return /peanut/.test(blob);
    if (key.includes('tree nut')) return /almond|cashew|walnut|pistachio|hazelnut|nut/.test(blob);
    if (key.includes('soy')) return /soy|soya/.test(blob);
    if (key.includes('sesame')) return /sesame/.test(blob);
    if (key.includes('shellfish')) return /shellfish|prawn|shrimp|crab|lobster/.test(blob);
    if (key.includes('fish')) return /fish|tilapia|catfish|salmon/.test(blob);
    if (key.includes('coconut')) return /coconut/.test(blob);
    return blob.includes(key);
  });
}

function recipeMatchesDiet(recipe: Recipe, diet: string) {
  if (!diet || diet === 'Any preference') return true;
  const tags = recipe.dietaryTags.map((t) => t.toLowerCase());
  if (diet === 'Plant-based') {
    return tags.some((t) => /vegan|plant/.test(t)) || !recipe.allergens.some((a) => /dairy|egg|meat|fish/i.test(a));
  }
  if (diet === 'Vegetarian') {
    return tags.some((t) => /vegetar|vegan|plant/.test(t)) || !/meat|fish|chicken|beef|goat|prawn/i.test(recipe.name + recipe.description);
  }
  return true;
}

export function MenuStudio() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reduce = useReducedMotion();
  const restaurantSlug = searchParams.get('restaurant');

  const [prefsOpen, setPrefsOpen] = useState(false);
  const [tab, setTab] = useState<StudioTab>('create');
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [region, setRegion] = useState('');
  const [occasion, setOccasion] = useState('Dinner');
  const [people, setPeople] = useState(2);
  const [kitchenTime, setKitchenTime] = useState('30 minutes');
  const [halal, setHalal] = useState('no');
  const [diet, setDiet] = useState('Any preference');
  const [avoided, setAvoided] = useState<string[]>([]);
  const [language, setLanguage] = useState('en-US');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiStatus, setAiStatus] = useState<'checking' | 'ready' | 'offline'>('checking');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [breads, setBreads] = useState<Bread[]>([]);
  const [saved, setSaved] = useState<MenuPlan[]>([]);
  const [savedError, setSavedError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [talkOpen, setTalkOpen] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const openTalk = () => setTalkOpen(true);
    window.addEventListener('chowsmart:open-talk', openTalk);
    return () => window.removeEventListener('chowsmart:open-talk', openTalk);
  }, []);

  useEffect(() => {
    setAiStatus('checking');
    const t = window.setTimeout(() => setAiStatus('ready'), 700);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    Promise.all([recipesService.list({ limit: 50 }), breadsService.list({ limit: 10 })])
      .then(([r, b]) => {
        setRecipes(r.items);
        setBreads([...b.items].sort((a, c) => a.number - c.number));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load studio data'));
  }, []);

  useEffect(() => {
    if (!restaurantSlug) return;
    restaurantsService
      .getBySlug(restaurantSlug)
      .then((restaurant) => {
        setPrompt(
          `Discuss a menu inspired by ${restaurant.name} in ${restaurant.city}. Suggest dishes that fit my table preferences.`
        );
        const cuisine = restaurant.cuisines?.[0]?.cuisine;
        if (cuisine) {
          const match = DESTINATIONS.find((d) => d.cuisine === cuisine.slug);
          if (match) setDestination(match);
        }
      })
      .catch(() => undefined);
  }, [restaurantSlug]);

  useEffect(() => {
    if (tab !== 'saved') return;
    if (!isAuthenticated) {
      setSaved([]);
      setSavedError('Log in to view saved menus.');
      return;
    }
    setSavedError('');
    menuPlansService
      .list({ limit: 20 })
      .then((data) => setSaved(data.items))
      .catch((err) => setSavedError(err instanceof Error ? err.message : 'Could not load saved menus'));
  }, [tab, isAuthenticated]);

  useEffect(() => {
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const inspirationRecipe = useMemo(() => {
    const nigerian = recipes.find((r) => r.cuisine?.slug === 'nigerian' || /jollof|moi|egusi/i.test(r.name));
    return nigerian || recipes.find((r) => r.featured) || recipes[0] || null;
  }, [recipes]);

  const maxMinutes = useMemo(() => {
    if (kitchenTime === '15 minutes') return 15;
    if (kitchenTime === '30 minutes') return 30;
    if (kitchenTime === '60 minutes') return 60;
    return Infinity;
  }, [kitchenTime]);

  function toggleAvoid(label: string) {
    setAvoided((prev) => (prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]));
  }

  function buildPlan(fromPrompt: string) {
    const cuisineSlug = destination.cuisine;
    let pool = recipes.filter((r) => {
      const cuisineOk =
        !cuisineSlug ||
        r.cuisine?.slug === cuisineSlug ||
        r.cuisine?.name.toLowerCase().includes(destination.label.toLowerCase());
      const timeOk = r.prepTime + r.cookTime <= maxMinutes || maxMinutes === Infinity;
      return cuisineOk && timeOk && recipeMatchesDiet(r, diet) && recipeMatchesAvoid(r, avoided);
    });

    if (pool.length < 2) {
      pool = recipes.filter((r) => recipeMatchesDiet(r, diet) && recipeMatchesAvoid(r, avoided));
    }

    const terms = fromPrompt.toLowerCase();
    pool = [...pool].sort((a, b) => {
      const score = (r: Recipe) =>
        (terms && r.name.toLowerCase().includes(terms.split(/\s+/)[0] || '') ? 2 : 0) +
        (r.featured ? 1 : 0) +
        (r.cuisine?.slug === cuisineSlug ? 2 : 0);
      return score(b) - score(a);
    });

    const picks = pool.slice(0, 4);
    const bread =
      breads.find((b) => /wheat/i.test(b.name)) ||
      breads[0] ||
      null;

    const items: ChatMessage['planItems'] = [
      ...picks.map((r) => ({
        itemType: 'RECIPE' as const,
        itemId: r.id,
        name: r.name,
        quantity: 1,
        calories: r.calories,
        price: null,
        notes: `${r.prepTime + r.cookTime} min · ${r.difficulty}`,
      })),
    ];

    if (bread) {
      items.push({
        itemType: 'BREAD',
        itemId: bread.id,
        name: bread.name,
        quantity: Math.max(1, Math.round(people / 2)),
        calories: bread.nutrition?.calories ? Math.round(bread.nutrition.calories) : 200,
        price: null,
        notes: bread.subtitle,
      });
    }

    const title = `${occasion} for ${people} · ${destination.label}${region ? ` (${region})` : ''}`;
    const lines = [
      `Here’s a ${occasion.toLowerCase()} plan for ${people} people, oriented around ${destination.label}${region ? ` / ${region}` : ''}.`,
      diet !== 'Any preference' ? `Dietary preference: ${diet}.` : '',
      avoided.length ? `Avoiding: ${avoided.join(', ')}.` : '',
      kitchenTime !== 'Any time' ? `Kitchen time target: ${kitchenTime}.` : '',
      halal === 'yes' ? 'Confirmed-halal discovery is still withheld where branch-level evidence is missing — verify with the venue.' : '',
      '',
      'Suggested courses from the ChowSmart development recipes:',
      ...items.map((item, i) => `${i + 1}. ${item.name}${item.notes ? ` — ${item.notes}` : ''}`),
      '',
      'These are development suggestions, not live restaurant stock. Check allergens, yields and seasoning in your kitchen.',
    ].filter(Boolean);

    return { title, text: lines.join('\n'), items };
  }

  async function handleSubmit(e?: FormEvent, chipPrompt?: string) {
    e?.preventDefault();
    const text = (chipPrompt ?? prompt).trim();
    if (!text || thinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setThinking(true);
    setError('');
    setSaveNote('');

    const plan = buildPlan(text);
    try {
      const catalogue = recipes
        .slice(0, 30)
        .map((recipe) => `${recipe.name} (${recipe.cuisine?.name || 'mixed cuisine'})`)
        .join(', ');
      const providerReply = await unwrap<{ message: string }>(
        api.post('/ai/chat', {
          message: `${text}\nAvailable recipe catalogue: ${catalogue}`,
          context: {
            destination: destination.label,
            people,
            diet,
          },
        })
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: `${providerReply.message}\n\n${plan.text}`,
          planItems: plan.items,
          planTitle: plan.title,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: plan.text,
          planItems: plan.items,
          planTitle: plan.title,
        },
      ]);
      setError(err instanceof Error ? `${err.message}. Showing local recipe suggestions.` : 'AI provider unavailable. Showing local recipe suggestions.');
    } finally {
      setThinking(false);
    }
  }

  async function deleteSavedPlan(id: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setDeletingId(id);
    setSavedError('');
    try {
      await menuPlansService.remove(id);
      setSaved((prev) => prev.filter((plan) => plan.id !== id));
      setSaveNote('Menu deleted.');
    } catch (err) {
      setSavedError(err instanceof Error ? err.message : 'Could not delete menu');
    } finally {
      setDeletingId(null);
    }
  }

  async function savePlan(message: ChatMessage) {
    if (!message.planItems?.length) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/menu-studio' } });
      return;
    }
    try {
      await menuPlansService.create({
        name: message.planTitle || 'Menu Studio plan',
        description: message.text.slice(0, 280),
        items: message.planItems.map((item, index) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          notes: item.notes || null,
          sortOrder: index,
          calories: item.calories,
          price: item.price,
        })),
      });
      setSaveNote('Menu saved to your account.');
      setTab('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save menu');
    }
  }

  function startDictation() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Dictation is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'auto' ? 'en-US' : language;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const said = event.results[0]?.[0]?.transcript || '';
      setPrompt((prev) => (prev ? `${prev} ${said}` : said));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopDictation() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function resetConversation() {
    setMessages([]);
    setPrompt('');
    setSaveNote('');
    setError('');
  }

  return (
    <div className="world-app">
      <TalkToChowSmartModal
        open={talkOpen}
        onClose={() => setTalkOpen(false)}
        prefs={{
          destination: destination.label,
          people,
          diet,
        }}
      />
      <div className="world-main">
        <motion.div
          className="world-intro"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <span className="eyebrow">
            <span /> LOCAL FLAVOURS. WORLDWIDE POSSIBILITIES.
          </span>
          <h1>
            What’s on <span>your menu?</span>
          </h1>
          <p>Choose your cuisine and preferences, then type or speak to plan a meal.</p>
        </motion.div>

        <div className="world-layout">
          <button
            type="button"
            className="preferences-toggle"
            aria-expanded={prefsOpen}
            aria-controls="menu-preferences"
            onClick={() => setPrefsOpen((v) => !v)}
          >
            <Earth size={18} aria-hidden />
            <span>
              {destination.label} · {people} people
            </span>
            <span>Edit preferences</span>
          </button>

          <aside
            id="menu-preferences"
            className={`world-settings${prefsOpen ? ' preferences-open' : ''}`}
          >
            <div className="settings-title">
              <Earth size={20} aria-hidden />
              <h2>Your table</h2>
            </div>

            <label htmlFor="cuisine-destination">Cuisine destination</label>
            <select
              id="cuisine-destination"
              className="country-select"
              value={destination.label}
              onChange={(e) => {
                const next = DESTINATIONS.find((d) => d.label === e.target.value);
                if (next) setDestination(next);
              }}
            >
              {DESTINATIONS.map((d) => (
                <option key={d.label} value={d.label}>
                  {d.label}
                </option>
              ))}
            </select>
            <small>249 countries and territories</small>

            <label htmlFor="region">Region or local tradition</label>
            <input
              id="region"
              maxLength={100}
              placeholder="E.g. Lagos, Yoruba cuisine"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />

            <div className="settings-pair">
              <div>
                <label htmlFor="occasion">Occasion</label>
                <select id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Any meal</option>
                </select>
              </div>
              <div>
                <label htmlFor="servings">People</label>
                <input
                  id="servings"
                  type="number"
                  min={1}
                  max={100}
                  value={people}
                  onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
            </div>

            <label htmlFor="time">Time in the kitchen</label>
            <select id="time" value={kitchenTime} onChange={(e) => setKitchenTime(e.target.value)}>
              <option>Any time</option>
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>60 minutes</option>
            </select>

            <label htmlFor="halal">Restaurant requirement</label>
            <select id="halal" value={halal} onChange={(e) => setHalal(e.target.value)}>
              <option value="no">No religious requirement specified</option>
              <option value="yes">Confirmed halal required</option>
            </select>

            <label htmlFor="diet">Dietary preference</label>
            <select id="diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
              <option>Any preference</option>
              <option>Plant-based</option>
              <option>Vegetarian</option>
            </select>

            <details>
              <summary>
                Ingredients to avoid <span>+</span>
              </summary>
              <div className="allergen-options">
                {ALLERGENS.map((label) => (
                  <label key={label}>
                    <input
                      type="checkbox"
                      checked={avoided.includes(label)}
                      onChange={() => toggleAvoid(label)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <small>Check labels and kitchen cross-contact before serving.</small>
            </details>

            <label htmlFor="language">Conversation language</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </aside>

          <section className="world-studio">
            <div className="studio-nav">
              <div>
                <button
                  type="button"
                  className={tab === 'create' ? 'selected' : ''}
                  onClick={() => setTab('create')}
                >
                  <Sparkles size={16} aria-hidden /> Create a menu
                </button>
                <button
                  type="button"
                  className={tab === 'saved' ? 'selected' : ''}
                  onClick={() => setTab('saved')}
                >
                  <Bookmark size={16} aria-hidden /> Saved menus
                </button>
              </div>
              <button type="button" aria-label="New conversation" title="New conversation" onClick={resetConversation}>
                <Plus size={18} aria-hidden />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {tab === 'create' ? (
                <motion.div
                  key="create"
                  variants={tabPanel}
                  initial={reduce ? false : 'hidden'}
                  animate="visible"
                  exit="exit"
                >
                  <div className="conversation" ref={conversationRef}>
                    {messages.length === 0 ? (
                      <motion.div
                        className="empty-conversation"
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: easeOut }}
                      >
                        <div className="studio-symbol">
                          <Sparkles size={26} aria-hidden />
                        </div>
                        <h2>What are we cooking today?</h2>
                        <p>
                          Explore {destination.label}, plan a family meal,
                          <br />
                          or build a menu around what you already have.
                        </p>
                        <div className="prompt-chips">
                          <button
                            type="button"
                            onClick={() => void handleSubmit(undefined, 'Plan a local dinner menu')}
                          >
                            Plan a local dinner menu <ArrowUpRight size={14} aria-hidden />
                          </button>
                          <button type="button" onClick={() => navigate('/restaurants')}>
                            Find restaurants in my city <ArrowUpRight size={14} aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleSubmit(undefined, 'Adapt a dish to my diet')}
                          >
                            Adapt a dish to my diet <ArrowUpRight size={14} aria-hidden />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div>
                        <AnimatePresence initial={false}>
                          {messages.map((message) => (
                            <motion.div
                              key={message.id}
                              className={`message ${message.role}`}
                              variants={chatBubble}
                              initial={reduce ? false : 'hidden'}
                              animate="visible"
                              layout
                            >
                              <span className="message-author">
                                {message.role === 'user' ? 'YOU' : 'CHOWSMART'}
                              </span>
                              {message.text}
                              {message.planItems?.length ? (
                                <div className="menu-plan-card">
                                  <h4>{message.planTitle}</h4>
                                  <ul>
                                    {message.planItems.map((item) => (
                                      <li key={`${item.itemType}-${item.itemId}`}>
                                        {item.name}
                                        {item.notes ? ` · ${item.notes}` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="plan-actions">
                                    <button type="button" onClick={() => void savePlan(message)}>
                                      Save menu
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleSubmit(
                                          undefined,
                                          `Adjust this plan for ${people + 2} people`
                                        )
                                      }
                                    >
                                      Adjust for more guests
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {thinking ? (
                          <motion.p
                            className="thinking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            Building a menu from your ChowSmart recipes…
                          </motion.p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <form className="world-composer" onSubmit={(e) => void handleSubmit(e)}>
                    <textarea
                      aria-label="Ask ChowSmart"
                      maxLength={6000}
                      rows={3}
                      placeholder="I have rice, tomatoes and beans. What can I make?"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="composer-actions">
                      <button
                        type="button"
                        className={listening ? 'recording' : ''}
                        onClick={() => (listening ? stopDictation() : startDictation())}
                      >
                        <Mic size={17} aria-hidden /> {listening ? 'Listening…' : 'Dictate'}
                      </button>
                      <span>
                        {people} people · {destination.label}
                      </span>
                      <button
                        className="send-button"
                        type="submit"
                        aria-label="Generate menu"
                        disabled={!prompt.trim() || thinking}
                      >
                        <ArrowUp size={21} aria-hidden />
                      </button>
                    </div>
                  </form>
                  <p className="composer-note">
                    Review dictated text before sending. Browser dictation may use a speech service.
                  </p>
                  <div className="connection-note">
                    <span className={aiStatus === 'ready' ? 'connected' : ''} />
                    {aiStatus === 'checking'
                      ? 'Checking AI connection…'
                      : aiStatus === 'ready'
                        ? 'Menu suggestions use your ChowSmart recipe library.'
                        : 'AI provider offline — local recipe matching is active.'}
                  </div>
                  {error ? <div className="world-error">{error}</div> : null}
                  {saveNote ? <p className="world-notice">{saveNote}</p> : null}
                </motion.div>
              ) : (
                <motion.div
                  key="saved"
                  className="saved-list"
                  variants={tabPanel}
                  initial={reduce ? false : 'hidden'}
                  animate="visible"
                  exit="exit"
                >
                  {savedError ? <div className="world-error">{savedError}</div> : null}
                  {!savedError && saved.length === 0 ? (
                    <div className="empty-conversation">
                      <h2>No saved menus yet</h2>
                      <p>Create a menu in the studio, then save it to your account.</p>
                    </div>
                  ) : null}
                  {saved.map((plan) => (
                    <details key={plan.id}>
                      <summary>
                        {plan.name}
                        <span>{new Date(plan.updatedAt).toLocaleDateString()}</span>
                      </summary>
                      <p>{plan.description || 'Saved from Menu Studio.'}</p>
                      <ul>
                        {(plan.items || []).map((item) => (
                          <li key={item.id || `${item.itemType}-${item.itemId}`}>
                            {item.quantity}× {item.name}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className="saved-delete"
                        disabled={deletingId === plan.id}
                        onClick={() => void deleteSavedPlan(plan.id, plan.name)}
                      >
                        <Trash2 size={14} aria-hidden />
                        {deletingId === plan.id ? 'Deleting…' : 'Delete menu'}
                      </button>
                    </details>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <section className="world-explore">
          <div className="explore-heading">
            <div>
              <span className="eyebrow">A LITTLE INSPIRATION</span>
              <h2>Start somewhere delicious.</h2>
            </div>
            <span>Rooted in culture. Open to discovery.</span>
          </div>
          <div className="inspiration-grid">
            <article className="country-inspiration">
              <figure className="menu-visual">
                <img
                  src={inspirationRecipe?.image || '/menus/world/NG.webp'}
                  alt={
                    inspirationRecipe
                      ? `${inspirationRecipe.name} — illustrative serving idea`
                      : 'Jollof & a little extra — illustrative serving idea'
                  }
                  loading="lazy"
                  decoding="async"
                  width={768}
                  height={512}
                />
                <figcaption>
                  {inspirationRecipe?.name || 'Jollof & a little extra'}
                  <small>AI illustration · serving may vary</small>
                </figcaption>
              </figure>
              <Earth size={23} aria-hidden />
              <span className="eyebrow">{destination.label}</span>
              <h3>{inspirationRecipe?.name || 'Jollof & a little extra'}</h3>
              <p>
                {inspirationRecipe?.description ||
                  'Tomato rice with a plant-based moi moi side and fresh vegetables.'}
              </p>
              <button
                type="button"
                onClick={() =>
                  void handleSubmit(
                    undefined,
                    inspirationRecipe
                      ? `Build a menu around ${inspirationRecipe.name}`
                      : 'Build a menu around jollof rice'
                  )
                }
              >
                Build a menu around this <ArrowUpRight size={17} aria-hidden />
              </button>
              <small>
                Sample inspiration · adaptations, not tested recipes. Ingredients and allergens need
                review.
              </small>
            </article>

            <Link className="kitchen-inspiration" to="/recipe-lab">
              <img src="/food-spread.webp" alt="Nigerian inspired dishes on a shared table" />
              <div>
                <span className="eyebrow">FROM OUR NIGERIAN KITCHEN</span>
                <h3 style={{ color: 'white' }}>
                  Good food starts
                  <br />
                  with good foundations.
                </h3>
                <span>
                  Explore bread recipes & nutrition <ArrowUpRight size={17} aria-hidden />
                </span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
