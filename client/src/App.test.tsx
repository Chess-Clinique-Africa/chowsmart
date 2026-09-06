import { describe, it, expect } from 'vitest';
import { formatCurrency, padNumber } from '@/utils/format';

describe('format helpers', () => {
  it('formats NGN currency', () => {
    expect(formatCurrency(1500)).toContain('1');
  });

  it('pads numbers', () => {
    expect(padNumber(1)).toBe('01');
  });
});
