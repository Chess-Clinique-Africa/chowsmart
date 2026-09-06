import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/UI/Input';

export function SearchBar({
  initial = '',
  placeholder = 'Search restaurants, recipes, breads…',
  onSubmit,
}: {
  initial?: string;
  placeholder?: string;
  onSubmit?: (q: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const debounced = useDebounce(value, 350);
  const navigate = useNavigate();

  function go(q: string) {
    const query = q.trim();
    if (onSubmit) onSubmit(query);
    else navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
    >
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (onSubmit) onSubmit(e.target.value);
        }}
        onBlur={() => {
          if (onSubmit) onSubmit(debounced);
        }}
        placeholder={placeholder}
        className="pl-10"
        aria-label="Search"
      />
    </form>
  );
}
