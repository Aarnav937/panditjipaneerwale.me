import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
const NotificationContext = createContext(null);
const storageKey = 'store_notification_state_v1';
function savedState() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return { read: Array.isArray(value.read) ? value.read : [], hidden: Array.isArray(value.hidden) ? value.hidden : [] };
  } catch { return { read: [], hidden: [] }; }
}
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
export function NotificationProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [local, setLocal] = useState(savedState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadNotifications = useCallback(async () => {
    if (!supabase) { setError('Store updates are temporarily unavailable.'); return; }
    setLoading(true);
    try {
      const { data, error: problem } = await supabase.from('notifications').select('id,title,body,target,created_at').eq('target', 'all').order('created_at', { ascending: false }).limit(50);
      if (problem) throw problem;
      setRecords(data || []); setError('');
    } catch { setError('Could not refresh store updates. Please retry.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    loadNotifications();
    const timer = setInterval(() => { if (document.visibilityState === 'visible') loadNotifications(); }, 30000);
    const wake = () => { if (document.visibilityState === 'visible') loadNotifications(); };
    document.addEventListener('visibilitychange', wake);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', wake); };
  }, [loadNotifications]);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(local)); } catch { /* Current-page state still works. */ } }, [local]);
  const notifications = useMemo(() => records.filter(n => !local.hidden.includes(n.id)).map(n => ({ ...n, read: local.read.includes(n.id) })), [records, local]);
  const remember = (field, ids) => setLocal(previous => ({ ...previous, [field]: [...new Set([...previous[field], ...ids])].slice(-1000) }));
  const value = { notifications, unreadCount: notifications.filter(n => !n.read).length, loading, error, loadNotifications,
    markAsRead: id => remember('read', [id]), markAllAsRead: () => remember('read', records.map(n => n.id)), deleteNotification: id => remember('hidden', [id]) };
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
export default NotificationContext;
