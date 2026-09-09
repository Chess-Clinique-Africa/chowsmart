import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/UI/Button';

export function Hero() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  return (
    <section className="page-shell grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-[120px]">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="flex min-h-[420px] flex-col justify-between lg:min-h-[520px]"
      >
        <div>
          <p className="mb-6 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted">
            Thoughtful menus, wherever you are
          </p>
          <h1 className="max-w-[11ch] text-[3rem] leading-[1.02] text-ink sm:text-[3.5rem] lg:text-[4rem]">
            <span className="block font-extrabold tracking-[-0.045em]">Your next meal.</span>
            <span className="font-serif-italic mt-1 block text-[2.85rem] text-accent sm:text-[3.35rem] lg:text-5xl">
              A little smarter.
            </span>
          </h1>
          <p className="mt-7 max-w-[34rem] text-[1.05rem] leading-relaxed text-muted">
            Discover global flavours, compare restaurant menus and turn good food ideas into a
            practical plan for your table.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/menu-studio')}>
              Explore the menu studio
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/restaurants')}>
              <MapPin className="h-4 w-4" aria-hidden />
              Find restaurant menus
            </Button>
          </div>
        </div>
        <div className="mt-14 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
          {['Dietary-Aware', 'Fresh & Halal Options', 'Fast Menu Planning'].map((badge) => (
            <span key={badge} className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {badge}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.1 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-[28px] bg-[#eceeea] shadow-soft">
          <img
            src="/hero-nigerian-plate.png"
            alt="Illustrated Nigerian jollof, moi moi and vegetable menu"
            className="aspect-[5/4] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-[18rem] p-6 text-white sm:max-w-sm sm:p-8">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/85">
              Nigerian inspiration
            </p>
            <p className="mt-2 text-[1.35rem] font-bold leading-snug tracking-tight sm:text-2xl">
              Good food starts with a good idea.
            </p>
            <p className="mt-2 text-[0.68rem] text-white/65">AI-generated serving illustration</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/menu-studio')}
          className="absolute -bottom-4 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-accent-bright text-white shadow-[0_12px_30px_rgba(13,155,130,0.45)] transition hover:scale-105"
          aria-label="Plan a menu"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      </motion.div>
    </section>
  );
}
