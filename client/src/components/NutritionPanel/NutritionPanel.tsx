import type { BreadNutrition } from '@/types';

export function NutritionPanel({ nutrition }: { nutrition: BreadNutrition }) {
  const rows = [
    { label: 'Calories', value: `${nutrition.calories} kcal` },
    { label: 'Protein', value: `${nutrition.protein} g` },
    { label: 'Carbohydrates', value: `${nutrition.carbohydrates} g` },
    { label: 'Fat', value: `${nutrition.fat} g` },
    { label: 'Fibre', value: `${nutrition.fibre} g` },
    { label: 'Sodium', value: `${nutrition.sodium} mg` },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-muted">{nutrition.perNote}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-accent/10 bg-accent/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{row.label}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-ink">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
