import { Link } from 'react-router-dom';
import { Image } from '@/components/UI/Image';
import type { Bread } from '@/types';

const STUDIO_IMAGES: Record<string, string> = {
  'wheat-baguette-bread': '/breads/wheat-studio.png',
  'wrapped-baguette-bread': '/breads/wrapped-studio.png',
  'honey-creamed-bread': '/breads/honey-studio.png',
  'chocolate-creamed-bread': '/breads/chocolate-studio.png',
  'coconut-creamed-bread': '/breads/coconut-studio.png',
};

export function BreadCard({ bread }: { bread: Bread }) {
  const num = String(bread.number).padStart(2, '0');
  const image = STUDIO_IMAGES[bread.slug] || bread.image;
  return (
    <Link
      to={`/breads/${bread.slug}`}
      className="relative flex min-h-[300px] min-w-[230px] max-w-[260px] snap-start flex-col justify-end overflow-hidden rounded-[1.35rem] bg-[#eceeea] p-5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(8,127,91,0.18)]"
    >
      <div className="absolute inset-0">
        <Image src={image} alt={bread.name} aspect="aspect-auto h-full" className="h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-accent/88 via-accent/30 to-transparent" />
      </div>
      <span className="absolute right-4 top-3 text-3xl font-extrabold tracking-tight text-white/20">
        {num}
      </span>
      <div className="relative z-10 text-white">
        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/75">
          {bread.category}
        </p>
        <h3 className="text-xl font-extrabold leading-tight tracking-tight">{bread.name}</h3>
        <p className="mt-3 text-sm text-white/85">Explore recipe & pairings</p>
      </div>
    </Link>
  );
}
