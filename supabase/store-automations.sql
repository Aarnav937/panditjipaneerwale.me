-- Additive store operations setup. Private worker state is never exposed by RLS.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
-- Extension-owned pg_net queues can be PUBLIC-readable. Never enqueue a reusable secret.
-- All browser subscription mutations must pass server validation and rate limits.
revoke insert,update,delete on public.push_subscriptions from public,anon,authenticated;
create schema if not exists store_private;
revoke all on schema store_private from public, anon, authenticated;
grant usage on schema store_private to service_role, authenticated;

create table if not exists public.store_daily_features (
  day date primary key, product_ids bigint[] not null, refreshed_at timestamptz not null default now()
);
alter table public.store_daily_features enable row level security;
revoke all on public.store_daily_features from anon, authenticated;
grant select on public.store_daily_features to anon, authenticated;
grant all on public.store_daily_features to service_role;
create policy daily_features_public on public.store_daily_features for select to anon, authenticated using (true);
create or replace function public.refresh_store_daily_features(p_day date default (now() at time zone 'Asia/Dubai')::date)
returns void language plpgsql security invoker set search_path='' as $$
begin
  insert into public.store_daily_features(day,product_ids)
  select p_day,coalesce(array_agg(id order by spotlight, priority, rank),array[]::bigint[]) from (
    select id,case when id=3 then 0 when storefront->>'featuredPromotion'='true' then 1 else 2 end as spotlight,
      case when storefront->>'featuredPromotion'='true' and (storefront->>'promotionPriority') ~ '^[0-9]{1,6}$' then (storefront->>'promotionPriority')::integer else 100 end as priority,
      md5(p_day::text||':'||id::text) as rank
    from public.products where is_available order by spotlight,priority,rank limit 8
  ) choices
  on conflict(day) do update set product_ids=excluded.product_ids,refreshed_at=now();
end $$;
revoke all on function public.refresh_store_daily_features(date) from public,anon,authenticated;
grant execute on function public.refresh_store_daily_features(date) to service_role;

create table store_private.push_outbox (
  id bigint generated always as identity primary key,
  notification_id uuid not null references public.notifications(id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  status text not null default 'pending' check(status in ('pending','processing','retry','delivered','failed')),
  attempts integer not null default 0, available_at timestamptz not null default now(),
  leased_until timestamptz, delivered_at timestamptz, last_error text,
  created_at timestamptz not null default now(), unique(notification_id,subscription_id)
);
create index push_outbox_pending on store_private.push_outbox(available_at) where status in ('pending','retry','processing');
create table store_private.push_registration_limits (bucket text primary key, day date not null, registrations integer not null);
alter table store_private.push_outbox enable row level security;
alter table store_private.push_registration_limits enable row level security;
revoke all on all tables in schema store_private from public,anon,authenticated;
grant all on all tables in schema store_private to service_role;
grant usage,select on all sequences in schema store_private to service_role;

-- Definer code is confined to an unexposed schema, with explicit caller checks.
create function store_private.push_config(p_config jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare config jsonb;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Server access required'; end if;
  perform pg_advisory_xact_lock(hashtext('store_web_push_config'));
  select decrypted_secret::jsonb into config from vault.decrypted_secrets where name='store_web_push';
  if config is null and p_config is not null then
    if length(p_config->>'publicKey')<>87 or length(p_config->>'privateKey')<>43 or length(p_config->>'anonKey')<30 then raise exception 'Invalid push configuration'; end if;
    config:=p_config||jsonb_build_object('workerToken',encode(extensions.gen_random_bytes(32),'hex'));
    perform vault.create_secret(config::text,'store_web_push','Store Web Push credentials; server access only');
  end if;
  return config;
end $$;
revoke all on function store_private.push_config(jsonb) from public,anon,authenticated;
grant execute on function store_private.push_config(jsonb) to service_role;
create function public.store_push_config(p_config jsonb default null) returns jsonb
language sql security invoker set search_path='' as $$ select store_private.push_config(p_config); $$;
revoke all on function public.store_push_config(jsonb) from public,anon,authenticated;
grant execute on function public.store_push_config(jsonb) to service_role;

create function public.register_store_push(p_endpoint text,p_keys jsonb,p_bucket text) returns void
language plpgsql security invoker set search_path='' as $$
declare used integer;
begin
  if p_endpoint !~ '^https://' or length(p_endpoint)>2048 or length(p_keys->>'p256dh')<80 or length(p_keys->>'auth')<20 or length(p_bucket)<>64 then raise exception 'Invalid subscription'; end if;
  insert into store_private.push_registration_limits values(p_bucket,current_date,1)
  on conflict(bucket) do update set day=current_date, registrations=case when store_private.push_registration_limits.day=current_date then store_private.push_registration_limits.registrations+1 else 1 end returning registrations into used;
  if used>100 then raise exception 'Subscription rate limit'; end if;
  insert into public.push_subscriptions(endpoint,keys,owner_id) values(p_endpoint,p_keys,null)
  on conflict(endpoint) do update set keys=excluded.keys;
end $$;
revoke all on function public.register_store_push(text,jsonb,text) from public,anon,authenticated;
grant execute on function public.register_store_push(text,jsonb,text) to service_role;

create function store_private.enqueue_push() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.target='all' then
    insert into store_private.push_outbox(notification_id,subscription_id)
    select new.id,id from public.push_subscriptions on conflict do nothing;
  end if;
  return new;
end $$;
revoke all on function store_private.enqueue_push() from public,anon,authenticated;
create trigger store_notification_push after insert on public.notifications for each row execute function store_private.enqueue_push();

create function public.claim_store_push(p_limit integer default 50) returns jsonb
language sql security invoker set search_path='' as $$
  with selected as (
    select id from store_private.push_outbox where attempts<5 and available_at<=now()
    and (status in ('pending','retry') or (status='processing' and leased_until<now()))
    order by id limit least(greatest(p_limit,1),50) for update skip locked
  ), leased as (
    update store_private.push_outbox set status='processing',attempts=attempts+1,leased_until=now()+interval '2 minutes'
    where id in(select id from selected) returning *
  ) select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'attempts',q.attempts,'subscriptionId',s.id,'endpoint',s.endpoint,'keys',s.keys,'title',n.title,'body',n.body)), '[]'::jsonb)
  from leased q join public.notifications n on n.id=q.notification_id join public.push_subscriptions s on s.id=q.subscription_id;
$$;
revoke all on function public.claim_store_push(integer) from public,anon,authenticated;
grant execute on function public.claim_store_push(integer) to service_role;
create function public.finish_store_push(p_id bigint,p_status integer) returns void
language plpgsql security invoker set search_path='' as $$
begin
  if p_status in(404,410) then
    delete from public.push_subscriptions where id=(select subscription_id from store_private.push_outbox where id=p_id);
  else
    update store_private.push_outbox set status=case when p_status between 200 and 299 then 'delivered' when attempts>=5 or p_status in(400,401,403) then 'failed' else 'retry' end,
      delivered_at=case when p_status between 200 and 299 then now() else null end,
      leased_until=null,available_at=now()+make_interval(mins=>least(60,power(2,attempts)::integer)),
      last_error=case when p_status between 200 and 299 then null else 'Push HTTP '||p_status end where id=p_id;
  end if;
end $$;
revoke all on function public.finish_store_push(bigint,integer) from public,anon,authenticated;
grant execute on function public.finish_store_push(bigint,integer) to service_role;

create function store_private.dispatch_push_tick() returns bigint
language plpgsql security definer set search_path='' as $$
declare config jsonb; request_id bigint; stamp text; signature text;
begin
  update store_private.push_outbox set status='failed',last_error='Delivery lease expired after final attempt',leased_until=null
  where status='processing' and leased_until<now() and attempts>=5;
  if not exists(select 1 from store_private.push_outbox where status in('pending','retry','processing') and available_at<=now() and attempts<5) then return null; end if;
  select decrypted_secret::jsonb into config from vault.decrypted_secrets where name='store_web_push';
  if config is null then return null; end if;
  stamp:=floor(extract(epoch from clock_timestamp()))::bigint::text;
  signature:=encode(extensions.hmac(convert_to('store-push:'||stamp,'UTF8'),convert_to(config->>'workerToken','UTF8'),'sha256'),'hex');
  select net.http_post(url:='https://gefgbjqddamzwkyxsakz.supabase.co/functions/v1/dispatch-push',
    headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(config->>'anonKey'),'apikey',config->>'anonKey','x-worker-timestamp',stamp,'x-worker-signature',signature),body:='{}'::jsonb,timeout_milliseconds:=15000) into request_id;
  return request_id;
end $$;
revoke all on function store_private.dispatch_push_tick() from public,anon,authenticated;

create function store_private.operations_status() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
  if not public.is_store_admin() then raise exception 'Administrator required'; end if;
  return jsonb_build_object('businessDay',(now() at time zone 'Asia/Dubai')::date,
    'dailyFeaturesReady',exists(select 1 from public.store_daily_features where day=(now() at time zone 'Asia/Dubai')::date),
    'pushConfigured',exists(select 1 from vault.secrets where name='store_web_push'),
    'subscribers',(select count(*) from public.push_subscriptions),
    'pushPending',(select count(*) from store_private.push_outbox where status in('pending','retry','processing')),
    'pushFailed',(select count(*) from store_private.push_outbox where status='failed'),
    'adminAccounts',(select count(*) from auth.users u join public.store_admins a on lower(u.email)=a.email),
    'authorizedAdmins',(select count(*) from public.store_admins),
    'jobs',(select jsonb_agg(jsonb_build_object('name',j.jobname,'active',j.active,'schedule',j.schedule,'lastStatus',(select status from cron.job_run_details d where d.jobid=j.jobid order by start_time desc limit 1))) from cron.job j where j.jobname in('store-daily-features','store-push-delivery')));
end $$;
revoke all on function store_private.operations_status() from public,anon;
grant execute on function store_private.operations_status() to authenticated;
create function public.store_operations_status() returns jsonb language sql security invoker set search_path='' as $$ select store_private.operations_status(); $$;
revoke all on function public.store_operations_status() from public,anon;
grant execute on function public.store_operations_status() to authenticated;

select public.refresh_store_daily_features();
select cron.schedule('store-daily-features','0 20 * * *',$job$select public.refresh_store_daily_features(); delete from public.store_daily_features where day < current_date-90; delete from store_private.push_outbox where created_at<now()-interval '30 days'; delete from store_private.push_registration_limits where day<current_date-2;$job$);
select cron.schedule('store-push-delivery','* * * * *',$job$select store_private.dispatch_push_tick();$job$);
