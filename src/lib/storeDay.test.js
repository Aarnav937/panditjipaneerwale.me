import { describe, it, expect } from 'vitest';
import { getTodaySeed } from './discounts';
import { nextStoreMidnight } from './storeDay';
describe('Abu Dhabi business day', () => {
  it('changes at midnight in Abu Dhabi regardless of the visitor timezone', () => {
    expect(getTodaySeed(new Date('2026-10-22T19:59:59Z'))).toBe('2026-10-22');
    expect(getTodaySeed(new Date('2026-10-22T20:00:00Z'))).toBe('2026-10-23');
  });
  it('schedules the next Dubai midnight without a yearly expiry', () => {
    expect(nextStoreMidnight(new Date('2026-12-31T19:59:00Z'))).toBe(60250);
    expect(nextStoreMidnight(new Date('2026-12-31T20:00:00Z'))).toBe(86400250);
  });
});
