import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadAdminRecords, reportStartDate } from './adminRecords';
const backend = vi.hoisted(() => ({ range: vi.fn() }));
vi.mock('./supabase', () => ({ supabase: { from: () => {
  const chain = { select: () => chain, order: () => chain, gte: () => chain, eq: () => chain, range: backend.range };
  return chain;
} } }));
describe('complete admin reports', () => {
  beforeEach(() => backend.range.mockReset());
  it('includes orders beyond the database response cap', async () => {
    backend.range.mockResolvedValueOnce({ data: Array.from({ length: 500 }, (_, id) => ({ id })), error: null })
      .mockResolvedValueOnce({ data: [{ id: 500 }], error: null });
    expect(await loadAdminRecords('orders')).toHaveLength(501);
    expect(backend.range).toHaveBeenNthCalledWith(2, 500, 999);
  });
  it('does not present partial reports if a later page fails', async () => {
    backend.range.mockResolvedValueOnce({ data: Array(500).fill({}), error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('Connection lost') });
    await expect(loadAdminRecords('orders')).rejects.toThrow('Connection lost');
  });
  it('starts today at Abu Dhabi midnight across the UTC date boundary', () => {
    expect(reportStartDate('today', new Date('2026-10-07T22:00:00Z'))).toBe('2026-10-07T20:00:00.000Z');
    expect(reportStartDate('all')).toBeUndefined();
  });
});
