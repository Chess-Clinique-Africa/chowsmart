import { ArrowRight, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/UI/Button';

export function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted">
      {children}
    </p>
  );
}

export function SectionTitle({ line1, line2 }: { line1: string; line2?: string }) {
  return (
    <h2 className="mt-3 max-w-3xl text-[2.1rem] font-extrabold tracking-tight text-ink sm:text-[2.6rem] lg:text-[2.85rem]">
      <span className="block">{line1}</span>
      {line2 ? (
        <span className="font-serif-italic mt-1 block font-normal text-ink">{line2}</span>
      ) : null}
    </h2>
  );
}

const pathways = [
  {
    soft: 'Follow your curiosity.',
    label: 'Explore the world',
    body: 'Choose a country and regional style. Explore menu inspiration with your preferences in mind.',
    to: '/recipe-lab',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
  },
  {
    soft: 'Discover what’s nearby.',
    label: 'Find a place',
    body: 'Browse checked official menu sources or refresh community listings for a selected city.',
    to: '/restaurants',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  },
  {
    soft: 'Make it work in the kitchen.',
    label: 'Plan for your table',
    body: 'Scale ingredients, compare estimated nutrition and build a menu from development recipes.',
    to: '/menu-studio',
    image:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80',
  },
];

export function PathwayCards() {
  const navigate = useNavigate();
  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-3">
      {pathways.map((item) => (
        <article key={item.to} className="flex flex-col">
          <p className="mb-4 text-lg font-medium text-ink-soft">{item.soft}</p>
          <div className="overflow-hidden rounded-[1.35rem] bg-[#eceeea]">
            <img
              src={item.image}
              alt={`AI menu illustration — ${item.label}`}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
            {item.label}
          </p>
          <h3 className="mt-2 text-xl font-extrabold tracking-tight text-ink">{item.soft}</h3>
          <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
          <button
            type="button"
            onClick={() => navigate(item.to)}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-accent-bright"
          >
            Explore
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </article>
      ))}
    </div>
  );
}

export function StatsStrip() {
  const stats = [
    { value: '249', label: 'country & territory selections' },
    { value: '17', label: 'development recipes' },
    { value: '30', label: 'city search areas' },
  ];

  return (
    <section className="page-shell">
      <div className="grid gap-8 border-y border-line py-10 sm:grid-cols-3 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[2.75rem] font-extrabold leading-none tracking-tight text-ink sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-3 max-w-[12rem] text-sm leading-snug text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClaritySection() {
  const items = [
    {
      title: 'Sources you can visit',
      body: 'Restaurant profiles link to their own menu sources, with check dates. Map listings are community data.',
    },
    {
      title: 'Recipes you can inspect',
      body: 'Nutrition estimates come from ingredient calculations and assumed yields—not from the appearance of a photo.',
    },
    {
      title: 'Preferences that matter',
      body: 'Use recipe allergen filters and dietary preferences. Confirmed-halal discovery is withheld where branch-level evidence is missing.',
    },
  ];

  return (
    <section className="page-shell py-20 lg:py-24">
      <SectionEyebrow>Clear about what we know</SectionEyebrow>
      <SectionTitle line1="Food inspiration." line2="With the details in view." />
      <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {items.map((item) => (
          <article key={item.title}>
            <h3 className="text-lg font-extrabold tracking-tight text-ink">{item.title}</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function VoiceSection() {
  const navigate = useNavigate();
  return (
    <section className="bg-bg-elevated">
      <div className="page-shell grid items-center gap-12 border-y border-line py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <SectionEyebrow>A conversation about food</SectionEyebrow>
          <h2 className="mt-3 text-[2.2rem] font-extrabold tracking-tight text-ink sm:text-[2.6rem]">
            Say what you’re craving.
          </h2>
          <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-muted">
            Use dictation to compose a request, review your words, and explore a spoken menu
            conversation when the AI provider is connected.
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted/80">
            Live AI and speech-to-speech require a secure provider connection. Availability and
            recognition vary by browser and language.
          </p>
          <Button className="mt-8" size="lg" onClick={() => navigate('/menu-studio')}>
            <Mic className="h-4 w-4" aria-hidden />
            Open menu studio
          </Button>
        </div>
        <div className="rounded-[1.75rem] border border-line bg-bg p-6 sm:p-8">
          <div className="space-y-3 text-sm">
            <p className="max-w-[90%] rounded-2xl rounded-bl-md bg-bg-elevated px-4 py-3 text-ink-soft shadow-sm ring-1 ring-line">
              “Something with jollof, not too spicy…”
            </p>
            <p className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-white shadow-sm">
              Suggesting a Lagos dinner board with wheat baguette and grilled fish.
            </p>
            <p className="max-w-[90%] rounded-2xl rounded-bl-md bg-bg-elevated px-4 py-3 text-ink-soft shadow-sm ring-1 ring-line">
              “Add a coconut bread for dessert.”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PctlBand() {
  return (
    <section className="page-shell py-20 lg:py-24">
      <SectionEyebrow>Part of Products and Consumers</SectionEyebrow>
      <SectionTitle line1="Everyday needs." line2="Connected thinking." />
      <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
        ChowSmart is part of PCTL’s portfolio of retail, consumer and emerging technology concepts.
      </p>
      <a
        href="https://chowsmart-pctl.chessclinique.chatgpt.site/"
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-accent-bright"
      >
        Explore the PCTL portfolio
        <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    </section>
  );
}

export function BreadFeature({
  image,
  onMeet,
}: {
  image?: string;
  onMeet: () => void;
}) {
  return (
    <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[1.75rem] bg-[#eceeea]">
        <img
          src={
            image ||
            'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'
          }
          alt="ChowSmart wheat baguette product concept"
          className="aspect-[5/4] w-full object-cover"
        />
      </div>
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Product concept · Proposed recipe
        </p>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
          Meet wheat baguette, wrapped baguette, honey, chocolate and coconut bread ideas. Explore
          proposed recipes, portion calculations and meal pairings.
        </p>
        <Button className="mt-8" size="lg" onClick={onMeet}>
          Meet the breads
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
