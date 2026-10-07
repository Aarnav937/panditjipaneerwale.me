import { createClient } from 'npm:@supabase/supabase-js@2.90.1';

const allowedOrigins = new Set(['https://panditjipaneerwale.me', 'https://www.panditjipaneerwale.me', 'http://127.0.0.1:5173', 'http://localhost:5173']);
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://panditjipaneerwale.me',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
  };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (origin && !allowedOrigins.has(origin)) return reply({ error: 'Origin not allowed' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return reply({ error: 'Use POST' }, 405);
  try {
    // Check the actual body length instead of trusting Content-Length.
    const text = await req.text();
    if (text.length > 16000) return reply({ error: 'Order is too large' }, 413);
    const body = JSON.parse(text);
    const phone = String(body.customer_phone ?? '').replace(/[+\s()-]/g, '').replace(/^05(?=\d{8}$)/, '9715');
    const name = String(body.customer_name ?? '').trim() || 'Customer';
    const address = String(body.customer_address ?? '').trim();
    const notes = String(body.notes ?? '').trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.request_id ?? '') ||
      !/^\d{10,15}$/.test(phone) || name.length > 80 || address.length < 5 || address.length > 500 || notes.length > 200 ||
      !Number.isFinite(body.total) || body.total <= 0 || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50 ||
      body.items.some((item: { id: number; quantity: number }) => !Number.isInteger(item.id) || item.id < 1 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50)) {
      return reply({ error: 'Please check your phone number, address and cart quantities.' }, 400);
    }
    // This key remains in the Edge Function, never in the browser or GitHub Pages build.
    const server = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await server.rpc('record_store_order', {
      p_request_id: body.request_id, p_phone: phone, p_name: name, p_address: address,
      p_items: body.items.map((item: { id: number; quantity: number }) => ({ id: item.id, quantity: item.quantity })),
      p_expected_total: body.total, p_notes: notes,
    });
    if (error) {
      const message = error.message;
      if (/Too many requests/.test(message)) return reply({ error: message }, 429);
      if (/Prices have changed|unavailable|Invalid|reference already used/.test(message)) return reply({ error: message }, 400);
      console.error('Order persistence failed', error.code);
      return reply({ error: 'We could not save your order. Please try again.' }, 503);
    }
    return reply({ order: data });
  } catch {
    return reply({ error: 'We could not save your order. Please check your details and try again.' }, 400);
  }
});
