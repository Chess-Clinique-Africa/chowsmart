import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink">{label}</span> : null}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-xl border bg-bg-elevated px-4 py-2.5 text-ink placeholder:text-muted transition-colors focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-bright/25 ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {hint && !error ? (
        <span id={`${inputId}-hint`} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${inputId}-error`} className="text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
});
