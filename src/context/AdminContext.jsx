import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
const AdminContext = createContext({});
export const useAdmin = () => useContext(AdminContext);
export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  useEffect(() => {
    let cancelled = false;
    setIsAdmin(false);
    setAdminError('');
    localStorage.removeItem('admin_session');
    if (!user?.id || !supabase) { setCheckingAdmin(false); return; }
    setCheckingAdmin(true);
    supabase.rpc('is_store_admin').then(({ data, error }) => {
      if (cancelled) return;
      setIsAdmin(!error && data === true);
      if (error) setAdminError('Could not verify administrator access. Please retry.');
      else if (data !== true) setAdminError('This account is not authorized to manage the store.');
    }).catch(() => { if (!cancelled) setAdminError('Could not verify administrator access.'); })
      .finally(() => { if (!cancelled) setCheckingAdmin(false); });
    return () => { cancelled = true; };
  }, [user?.id]);
  const logoutAdmin = async () => { setIsAdmin(false); await supabase?.auth.signOut(); };
  const value = { isAdmin, checkingAdmin, adminError, adminEmail: user?.email || '', logoutAdmin,
    checkAdminCode: () => false, getSessionTimeRemaining: () => null };
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
export default AdminContext;
