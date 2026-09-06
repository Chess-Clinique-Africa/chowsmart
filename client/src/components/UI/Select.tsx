import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className = '', id, ...props },
  ref
) {
  const selectId = id || props.name;
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink">{label}</span> : null}
      <select
        ref={ref}
        id={selectId}
        className={`w-full appearance-none rounded-xl border bg-bg-elevated px-4 py-2.5 text-ink transition-colors focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-bright/25 ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder ? (
          <option value="">
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
});
