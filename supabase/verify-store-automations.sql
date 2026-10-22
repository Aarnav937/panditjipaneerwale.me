-- Run as the project database administrator. Every fixture and price edit is rolled back.
begin;
create temporary table original_store_prices as select id,price,compare_at_price from public.products;
update public.products set compare_at_price=price*2 where is_available;
select public.refresh_store_daily_features('2099-01-01');
select public.refresh_store_daily_features('2099-01-02');
do $$
declare first_day bigint[]; second_day bigint[]; sub_id uuid; notice_id uuid; job_id bigint;
begin
  select product_ids into first_day from public.store_daily_features where day='2099-01-01';
  select product_ids into second_day from public.store_daily_features where day='2099-01-02';
  if first_day[1:4]<>array[3,194,195,193]::bigint[] or cardinality(first_day)<>8 or first_day=second_day then
    raise exception 'Daily promotion priority or rotation failed';
  end if;
  perform public.refresh_store_daily_features('2099-01-01');
  if first_day<>(select product_ids from public.store_daily_features where day='2099-01-01') then raise exception 'Daily selection is unstable'; end if;
  if has_table_privilege('authenticated','public.push_subscriptions','INSERT') or has_table_privilege('authenticated','public.push_subscriptions','UPDATE') or has_table_privilege('authenticated','public.push_subscriptions','DELETE') then
    raise exception 'Browser can bypass subscription registration';
  end if;
  if has_function_privilege('anon','public.store_push_config(jsonb)','EXECUTE') or has_function_privilege('authenticated','public.claim_store_push(integer)','EXECUTE') or has_function_privilege('anon','store_private.dispatch_push_tick()','EXECUTE') then
    raise exception 'Private worker access exposed';
  end if;
  if position('x-worker-token' in pg_get_functiondef('store_private.dispatch_push_tick()'::regprocedure))>0 then raise exception 'Reusable secret enqueued'; end if;
  insert into public.push_subscriptions(endpoint,keys) values ('https://127.0.0.1/rollback-only-operations-fixture','{"p256dh":"fixture","auth":"fixture"}') returning id into sub_id;
  insert into public.notifications(title,body,target) values ('Rollback operations fixture','No message is sent','all') returning id into notice_id;
  select id into job_id from store_private.push_outbox where subscription_id=sub_id and notification_id=notice_id;
  if job_id is null then raise exception 'Announcement was not queued'; end if;
  update store_private.push_outbox set attempts=1,status='processing' where id=job_id;
  perform public.finish_store_push(job_id,500);
  if (select status from store_private.push_outbox where id=job_id)<>'retry' then raise exception 'Transient failures must retry'; end if;
  perform public.finish_store_push(job_id,201);
  if (select status from store_private.push_outbox where id=job_id)<>'delivered' then raise exception 'Successful delivery not recorded'; end if;
end $$;
-- Verify rotation itself did not change selling prices.
do $$ begin
  if exists(select id,price from public.products except select id,price from original_store_prices) then raise exception 'Rotation changed selling prices'; end if;
end $$;
rollback;
select 'PASS: pinned daily rotation, worker isolation, signed queue, subscription grants and retries; fixtures rolled back' as result;
