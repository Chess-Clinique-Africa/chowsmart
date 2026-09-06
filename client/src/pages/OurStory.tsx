import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/UI/Button';
import { useNavigate } from 'react-router-dom';

const sections = [
  {
    title: 'Who we are',
    body: 'ChowSmart is a restaurant discovery and thoughtful-menu platform from Products and Consumers Technologies Limited (PCTL). We connect curious eaters with kitchens, recipes and a curated bread collection.',
  },
  {
    title: 'Why ChowSmart exists',
    body: 'Great meals deserve better planning. ChowSmart helps people discover where to eat, what to cook and how to assemble a complete menu — with nutrition and pairings that feel intentional.',
  },
  {
    title: 'Food discovery',
    body: 'From Lagos jollof houses to Mediterranean tables, we surface restaurants and dishes with clear cuisine, price and dietary context — so discovery feels editorial, not noisy.',
  },
  {
    title: 'Better menu planning',
    body: 'Menu Studio turns browsing into building: starters, mains, breads and recipes arranged, costed and saved for guests, events or weeknight service.',
  },
  {
    title: 'Nigerian & African food culture',
    body: 'Our catalogue begins with Nigerian and broader African flavours — suya, egusi, party jollof — then opens to worldwide cuisines that share the same table.',
  },
  {
    title: 'Our approach',
    body: 'Premium editorial design, kitchen-aware data and tools that respect how people actually eat. Concept breads are modelled carefully; every formula still asks for kitchen validation.',
  },
  {
    title: 'Our vision',
    body: 'A trusted home for food discovery and menu intelligence — where ChowSmart breads, recipes and restaurants compose meals worth remembering.',
  },
];

export function OurStory() {
  const navigate = useNavigate();
  return (
    <article>
      <section className="border-b border-line bg-bg-elevated">
        <div className="page-shell py-20">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted">
            Our story
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <span className="block">Everyday needs.</span>
            <span className="font-serif-italic mt-1 block font-normal">Connected thinking.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            ChowSmart by PCTL — restaurant discovery, thoughtful menus and a bread collection
            designed as a bridge between everyday baking and complete dining.
          </p>
        </div>
      </section>

      <div className="page-shell space-y-14 py-16">
        {sections.map((section, index) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: index * 0.04 }}
            className="grid gap-4 border-t border-line pt-10 md:grid-cols-[0.4fr_0.6fr]"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {section.title}
            </h2>
            <p className="text-lg leading-relaxed text-muted">{section.body}</p>
          </motion.section>
        ))}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/breads')}>See the breads</Button>
          <Button variant="outline" onClick={() => navigate('/restaurants')}>
            Browse restaurants
          </Button>
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent-bright"
          >
            Back to home
          </Link>
        </div>
      </div>
    </article>
  );
}
