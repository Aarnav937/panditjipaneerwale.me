import { supabase } from './supabase';

// Supabase caps individual responses; fetch every page so reports do not silently stop at 1,000.
export async function loadAdminRecords(table, { columns = '*', startDate, phone } = {}) {
  if (!supabase) throw new Error('Database is not connected.');
  const records = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    let query = supabase.from(table).select(columns).order('created_at', { ascending: false }).order('id', { ascending: true });
    if (startDate) query = query.gte('created_at', startDate);
    if (phone) query = query.eq('customer_phone', phone);
    const { data, error } = await query.range(offset, offset + pageSize - 1);
    if (error) throw error;
    records.push(...(data || []));
    if (!data || data.length < pageSize) return records;
  }
}

export function reportStartDate(range, now = new Date()) {
  if (range === 'all') return undefined;
  if (range === 'today') {
    const day = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Dubai' });
    return new Date(`${day}T00:00:00+04:00`).toISOString();
  }
  return new Date(now.getTime() - Number(range) * 24 * 60 * 60 * 1000).toISOString();
}
