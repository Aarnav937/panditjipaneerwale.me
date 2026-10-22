import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import webpush from 'npm:web-push@3.6.7';
import { isPushSubscription } from '../_shared/push-validation.js';
import { verifyWorkerRequest } from '../_shared/worker-auth.js';
Deno.serve(async req => {
  const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  if(req.method!=='POST') return reply({error:'Use POST'},405);
  try {
    const server=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:config,error}=await server.rpc('store_push_config');
    if(error || !config || !await verifyWorkerRequest(req.headers.get('x-worker-timestamp'),req.headers.get('x-worker-signature'),config.workerToken)) return reply({error:'Unauthorized'},401);
    webpush.setVapidDetails('mailto:rrc.inttrading@gmail.com',config.publicKey,config.privateKey);
    const {data:jobs,error:claimError}=await server.rpc('claim_store_push',{p_limit:50});
    if(claimError) throw claimError;
    let delivered=0, failed=0;
    // Bounded parallel batches keep a slow endpoint from blocking every customer.
    for(let offset=0;offset<jobs.length;offset+=5) {
      await Promise.all(jobs.slice(offset,offset+5).map(async(job:any)=>{
        let status=400;
        if(isPushSubscription(job)) {
          try {
            const response=await webpush.sendNotification({endpoint:job.endpoint,keys:job.keys},JSON.stringify({title:job.title,body:job.body,url:'/',tag:'store-'+job.id}),{TTL:3600,timeout:7000});
            status=response.statusCode;
          } catch(error:any) { status=Number(error.statusCode)||503; }
        }
        const done=await server.rpc('finish_store_push',{p_id:job.id,p_status:status});
        if(done.error) throw done.error;
        if(status>=200 && status<300) delivered++; else failed++;
      }));
    }
    return reply({processed:jobs.length,delivered,failed});
  } catch { return reply({error:'Delivery worker failed; leased jobs will be retried.'},503); }
});
