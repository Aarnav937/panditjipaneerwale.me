import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import webpush from 'npm:web-push@3.6.7';
import { isPushSubscription } from '../_shared/push-validation.js';
const origins = new Set(['https://panditjipaneerwale.me','https://www.panditjipaneerwale.me','http://127.0.0.1:5173','http://127.0.0.1:4173','http://localhost:5173']);
Deno.serve(async req => {
  const origin = req.headers.get('origin') || '';
  const headers = {'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origins.has(origin)?origin:'https://panditjipaneerwale.me','Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
  const reply = (data: unknown,status=200) => new Response(JSON.stringify(data),{status,headers});
  if (origin && !origins.has(origin)) return reply({error:'Origin not allowed'},403);
  if (req.method==='OPTIONS') return new Response(null,{status:204,headers});
  if (req.method!=='POST') return reply({error:'Use POST'},405);
  try {
    const text=await req.text(); if(text.length>6000) return reply({error:'Request too large'},413);
    const body=JSON.parse(text);
    if (!['config','subscribe','unsubscribe'].includes(body.op)) return reply({error:'Invalid operation'},400);
    const server=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
    if(body.op==='config') {
      let {data:config,error}=await server.rpc('store_push_config');
      if(error) throw error;
      if(!config) {
        const keys=webpush.generateVAPIDKeys();
        const initialized=await server.rpc('store_push_config',{p_config:{...keys,anonKey:Deno.env.get('SUPABASE_ANON_KEY')}});
        if(initialized.error) throw initialized.error; config=initialized.data;
      }
      return reply({publicKey:config.publicKey});
    }
    if(!isPushSubscription(body.subscription)) return reply({error:'Invalid browser subscription'},400);
    const {endpoint,keys}=body.subscription;
    if(body.op==='unsubscribe') {
      const {error}=await server.from('push_subscriptions').delete().eq('endpoint',endpoint).eq('keys->>auth',keys.auth);
      if(error) throw error;
      return reply({success:true});
    }
    const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')+ip));
    const bucket=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    const {error}=await server.rpc('register_store_push',{p_endpoint:endpoint,p_keys:{p256dh:keys.p256dh,auth:keys.auth},p_bucket:bucket});
    if(error) return reply({error:'Could not register notifications. Please try again later.'},/rate limit/.test(error.message)?429:503);
    return reply({success:true});
  } catch { return reply({error:'Could not configure browser notifications. Please retry.'},503); }
});
