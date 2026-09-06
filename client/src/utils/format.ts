export function formatCurrency(amount: number | null | undefined, currency = 'NGN'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₦${Math.round(amount).toLocaleString('en-NG')}`;
  }
}

export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined || Number.isNaN(rating)) return '—';
  return rating.toFixed(1);
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function padNumber(n: number, digits = 2): string {
  return String(n).padStart(digits, '0');
}

export function difficultyLabel(d: string): string {
  return d.charAt(0) + d.slice(1).toLowerCase();
}
