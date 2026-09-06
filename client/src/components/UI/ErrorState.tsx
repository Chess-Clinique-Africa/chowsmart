import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-6 py-14 text-center"
    >
      <AlertCircle className="h-8 w-8 text-danger" aria-hidden />
      <h3 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h3>
      <p className="max-w-md text-muted">{message}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
