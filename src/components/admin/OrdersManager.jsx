import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Download, ShoppingBag } from 'lucide-react';
import { db } from '../../lib/supabase';
import { loadAdminRecords } from '../../lib/adminRecords';
import { exportCsv } from '../../lib/orderReports';

const STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];
const LABELS = { pending: 'New request', confirmed: 'Confirmed', delivered: 'Delivered', cancelled: 'Cancelled' };
export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [saving, setSaving] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setOrders(await loadAdminRecords('orders'));
    } catch (err) { setError(err.message || 'Could not load orders.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const visible = orders.filter((order) => (status === 'all' || order.status === status) &&
    `${order.id} ${order.customer_name} ${order.customer_phone} ${order.customer_address}`.toLowerCase().includes(query.toLowerCase()));
  async function update(order, next) {
    setSaving(order.id); setError('');
    try {
      const { data, error: problem } = await db.orders.updateStatus(order.id, next);
      if (problem || !data) throw problem || new Error('Order status was not saved.');
      setOrders((current) => current.map((entry) => entry.id === order.id ? data : entry));
    } catch (err) { setError(err.message || 'Could not update order status.'); }
    finally { setSaving(null); }
  }
  const exportOrders = () => exportCsv(`store-orders-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Reference', 'Date', 'Customer', 'Phone', 'Address', 'Status', 'Total AED', 'Items', 'Delivery notes'],
    visible.map((order) => [order.id, order.created_at, order.customer_name, order.customer_phone, order.customer_address,
      order.status, order.total, (order.items || []).map((item) => `${item.name} x${item.quantity}`).join('; '), order.notes]));
  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-xl font-bold"><ShoppingBag className="h-5 w-5 text-orange-400" />Orders</h3>
      <div className="flex gap-2"><button aria-label="Refresh orders" onClick={load} className="rounded-xl bg-slate-800 p-3"><RefreshCw className="h-5 w-5" /></button><button onClick={exportOrders} className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-800 px-3 text-sm font-semibold"><Download className="h-4 w-4" />Export CSV</button></div>
    </div>
    <p className="text-sm text-slate-400">New requests are saved before WhatsApp opens. Confirm an order after the customer sends their message.</p>
    <div className="flex flex-col gap-3 sm:flex-row"><input aria-label="Search orders" placeholder="Search name, phone, address or reference…" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-800 px-3 text-sm" /><select aria-label="Filter order status" value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-xl border border-slate-600 bg-slate-800 px-3 text-sm"><option value="all">All statuses</option>{STATUSES.map((value) => <option key={value} value={value}>{LABELS[value]}</option>)}</select></div>
    {error && <p role="alert" className="rounded-xl bg-red-950 p-4 text-sm text-red-200">{error}</p>}
    {loading ? <p role="status" className="py-8 text-center text-slate-400">Loading orders…</p> : <>
      <p className="text-sm text-slate-400">{visible.length} order requests</p>
      {!visible.length && <p className="rounded-2xl border border-slate-700 p-8 text-center text-slate-400">No matching orders.</p>}
      {visible.map((order) => <article key={order.id} className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">PJ-{order.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-xs text-slate-400">{new Date(order.created_at).toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}</p></div><p className="text-lg font-bold text-emerald-400">AED {Number(order.total).toFixed(2)}</p></div>
        <p className="mt-4 font-semibold">{order.customer_name || 'Customer'} · {order.customer_phone}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-300">{order.customer_address}</p><p className="mt-2 text-xs text-slate-400">{order.notes}</p>
        <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold text-orange-300">View items ({order.items?.length || 0})</summary><ul className="mt-2 space-y-2">{(order.items || []).map((item, index) => <li key={`${item.id}-${index}`} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span className="shrink-0">AED {(Number(item.price) * item.quantity).toFixed(2)}</span></li>)}</ul></details>
        <label className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">Order status<select aria-label={`Status for PJ-${order.id.slice(0, 8).toUpperCase()}`} value={order.status || 'pending'} disabled={saving === order.id} onChange={(e) => update(order, e.target.value)} className="min-h-11 rounded-xl border border-slate-600 bg-slate-900 px-3 text-sm">{STATUSES.map((value) => <option key={value} value={value}>{LABELS[value]}</option>)}</select>{saving === order.id && <span>Saving…</span>}</label>
      </article>)}
    </>}
  </section>;
}
