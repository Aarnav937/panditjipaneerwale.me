import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AnalyticsDashboard from './AnalyticsDashboard';
const orders = [
  { id: 'one', customer_name: 'First', customer_phone: '971501111111', total: 20, status: 'delivered', created_at: '2026-10-07T12:00:00Z', items: [{ id: 3, name: 'Fresh Paneer', quantity: 1, price: 20 }] },
  { id: 'two', customer_name: 'Second', customer_phone: '971502222222', total: 15, status: 'confirmed', created_at: '2026-10-07T13:00:00Z', items: [{ id: 195, name: 'White Butter', quantity: 1, price: 15 }] },
  { id: 'three', customer_phone: '971502222222', total: 100, status: 'cancelled', created_at: '2026-10-07T13:00:00Z', items: [] },
  { id: 'four', customer_phone: '971502222222', total: 10, status: 'pending', created_at: '2026-10-07T13:00:00Z', items: [] },
];
vi.mock('../../lib/supabase', () => ({ supabase: { from: (table) => {
  const result = table === 'orders' ? { data: orders, error: null } : { data: [], error: null };
  const chain = { select: () => chain, gte: () => chain, order: () => chain, range: async () => result };
  return chain;
} } }));
describe('actual order reporting', () => {
  it('uses checkout totals and phone identifiers, excluding pending and cancelled requests from sales', async () => {
    render(<AnalyticsDashboard />);
    expect((await screen.findAllByText('AED 35.00')).length).toBeGreaterThan(0);
    expect(screen.getByText('Fresh Paneer')).toBeInTheDocument();
    expect(screen.getByText('971501111111')).toBeInTheDocument();
    expect(screen.getByText('Customers').parentElement.parentElement).toHaveTextContent('2');
  });
});
