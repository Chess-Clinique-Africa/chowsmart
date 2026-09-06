import type { FilterOption } from '@/types';
import { Select } from '@/components/UI/Select';

export function FilterPanel({
  filters,
  values,
  onChange,
}: {
  filters: { key: string; label: string; options: FilterOption[] }[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {filters.map((filter) => (
        <Select
          key={filter.key}
          label={filter.label}
          value={values[filter.key] || ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
          placeholder="All"
          options={filter.options}
        />
      ))}
    </div>
  );
}
