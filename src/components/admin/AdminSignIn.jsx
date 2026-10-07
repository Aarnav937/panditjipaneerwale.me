import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../context/AdminContext';

export default function AdminSignIn({ onClose }) {
  const { checkingAdmin, adminError, adminEmail, logoutAdmin } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (!supabase) throw new Error('The store database is not connected.');
      const credentials = { email: email.trim().toLowerCase() };
      const result = await supabase.auth.signInWithPassword({ ...credentials, password });
      if (result.error) throw result.error;
      setPassword('');
    } catch (err) {
      setError(err.message || 'Could not sign in. Please try again.');
    } finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <section role="dialog" aria-modal="true" aria-labelledby="admin-login-title" className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
      <button aria-label="Close admin sign-in" onClick={onClose} className="absolute right-3 top-3 rounded-xl p-3"><X className="h-5 w-5" /></button>
      <ShieldCheck className="mb-4 h-9 w-9 text-emerald-600" />
      <h2 id="admin-login-title" className="text-2xl font-bold">Store administrator</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in with an authorized account to manage orders and customers.</p>
      {checkingAdmin ? <p role="status" className="mt-6 flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Verifying access…</p> : <>
        {(error || adminError) && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error || adminError}</p>}
        {adminEmail && <button onClick={logoutAdmin} className="mt-3 text-sm font-semibold underline">Sign out of {adminEmail}</button>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold">Admin email<input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-transparent px-3 dark:border-slate-600" /></label>
          <label className="block text-sm font-semibold">Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-transparent px-3 dark:border-slate-600" /></label>
          <button disabled={busy} type="submit" className="min-h-12 w-full rounded-xl bg-emerald-600 px-4 font-bold text-white disabled:opacity-60">{busy ? 'Please wait…' : 'Sign in securely'}</button>
        </form>
      </>}
    </section>
  </div>;
}
