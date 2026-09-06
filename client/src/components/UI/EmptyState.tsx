import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-accent/20 bg-accent/5 px-6 py-16 text-center">
      {icon ? <div className="text-accent-bright">{icon}</div> : null}
      <h3 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h3>
      {description ? <p className="max-w-md text-muted">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
