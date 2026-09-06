import type { ReactNode } from 'react';

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-accent/15 bg-accent/5 px-2.5 py-0.5 text-xs font-semibold text-ink ${className}`}
    >
      {children}
    </span>
  );
}
