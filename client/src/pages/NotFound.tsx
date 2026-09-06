import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/UI/Button';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <section className="page-shell flex flex-col items-center py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="mt-3 font-extrabold tracking-tight text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        That route is not on the ChowSmart map. Head back to discover restaurants, breads or recipes.
      </p>
      <Button className="mt-8" onClick={() => navigate('/')}>
        Back home
      </Button>
      <Link to="/restaurants" className="mt-4 text-sm text-muted hover:text-ink">
        Or browse restaurants
      </Link>
    </section>
  );
}
