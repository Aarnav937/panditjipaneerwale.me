import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
export default function OperationsStatus() {
  const [status,setStatus]=useState(null),[error,setError]=useState('');
  const refresh=useCallback(async()=>{
    try {
      if(!supabase) throw new Error('Store database is not connected.');
      const {data,error:problem}=await supabase.rpc('store_operations_status');
      if(problem) throw problem;
      setStatus(data);setError('');
    } catch {setError('Could not verify store automations. Please refresh.');}
  },[]);
  useEffect(()=>{refresh();const timer=setInterval(refresh,30000);return()=>clearInterval(timer);},[refresh]);
  return <section className="mb-5 rounded-2xl border border-slate-700 bg-slate-800 p-4 text-sm" aria-label="Store automation status">
    <div className="flex items-center justify-between"><h3 className="font-bold">Store operations</h3><button onClick={refresh} className="min-h-10 px-3 text-orange-300">Refresh status</button></div>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {status && <><div className="mt-2 grid gap-2 sm:grid-cols-2">
      <p>Abu Dhabi day: {status.businessDay}</p><p>Daily features: {status.dailyFeaturesReady?'Ready':'Needs attention'}</p>
      <p>Browser push: {status.pushConfigured?'Configured':'Needs setup'} · {status.subscribers} devices</p>
      <p>Push queue: {status.pushPending} pending · {status.pushFailed} failed</p>
      <p>Administrator accounts: {status.adminAccounts}/{status.authorizedAdmins}</p>
      {status.jobs?.map(job=><p key={job.name}>{job.name==='store-daily-features'?'Midnight offers':'Push delivery'}: {job.active?(job.lastStatus||'Scheduled'):'Paused'}</p>)}
    </div><p className="mt-3 text-xs text-slate-400">Orders and reports refresh while open. Pending requests become sales only after staff confirmation. Browser alerts require each customer’s permission.</p></>}
  </section>;
}
