import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#15593e] text-white hover:bg-[#0c412b] border border-transparent active:scale-[0.98]',
  secondary: 'bg-ink text-white hover:bg-accent-deep border border-transparent active:scale-[0.98]',
  ghost: 'bg-transparent text-ink hover:bg-line/70 border border-transparent',
  danger: 'bg-danger text-white hover:opacity-90 border border-transparent',
  outline:
    'bg-bg-elevated text-[#21563a] border border-[#c8d6c9] hover:bg-[#f7faf7] hover:text-ink active:scale-[0.98]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-[0.95rem]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', variant = 'primary', size = 'md', loading, disabled, children, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-[8px] font-semibold tracking-tight transition-[background-color,color,border-color,transform,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      ) : null}
      {children}
    </button>
  );
});
