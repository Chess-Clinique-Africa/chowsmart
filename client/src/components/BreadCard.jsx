import { Link } from 'react-router-dom';

const visualClass = {
  'wheat-baguette': 'wheat',
  'wrapped-baguette': 'wrapped',
  'honey-creamed': 'honey',
  'chocolate-creamed': 'chocolate',
  'coconut-creamed': 'coconut',
};

export default function BreadCard({ bread }) {
  const num = String(bread.number).padStart(2, '0');
  return (
    <Link className="bread-card" to={`/breads/${bread.slug}`}>
      <span className={`bread-visual ${visualClass[bread.slug] || 'wheat'}`} aria-hidden />
      <span className="num">{num}</span>
      <span className="eyebrow">{bread.eyebrow}</span>
      <h3>{bread.name}</h3>
      <span className="explore">Explore recipe & pairings</span>
    </Link>
  );
}
