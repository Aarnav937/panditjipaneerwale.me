-- Run through a privileged SQL session; every fixture is rolled back.
begin;
do $$
declare
  request uuid := gen_random_uuid();
  receipt jsonb;
  retry jsonb;
  count_before integer := (select count(*) from public.orders);
begin
  receipt := public.record_store_order(request, '0000000000', 'Backend acceptance test',
    'Test address Abu Dhabi', '[{"id":194,"quantity":2},{"id":195,"quantity":1}]', 35, 'Acceptance test');
  retry := public.record_store_order(request, '0000000000', 'Backend acceptance test',
    'Test address Abu Dhabi', '[{"id":195,"quantity":1},{"id":194,"quantity":2}]', 35, 'Acceptance test');
  if receipt->>'id' <> retry->>'id' or (receipt->>'total')::numeric <> 35 or
    (select count(*) from public.orders) <> count_before + 1 or
    (select count(*) from public.order_items where order_id=(receipt->>'id')::uuid) <> 2 then
    raise exception 'Receipt/idempotency acceptance failed';
  end if;
  begin
    perform public.record_store_order(gen_random_uuid(), '0000000000', 'Test', 'Test address', '[{"id":194,"quantity":1}]', 1, '');
    raise exception 'Tampered total accepted';
  exception when others then
    if sqlerrm not like 'Prices have changed%' then raise; end if;
  end;
  begin
    perform public.record_store_order(gen_random_uuid(), '0000000000', 'Test', 'Test address', '[{"id":194,"quantity":0}]', 10, '');
    raise exception 'Invalid quantity accepted';
  exception when others then
    if sqlerrm not like 'Invalid product quantities%' then raise; end if;
  end;
  begin
    perform public.record_store_order(gen_random_uuid(), '0000000000', 'Test', 'Test address', '[{"id":999999,"quantity":1}]', 10, '');
    raise exception 'Unknown product accepted';
  exception when others then
    if sqlerrm not like 'A product is unavailable%' then raise; end if;
  end;
  begin
    perform public.record_store_order(request, '0000000000', 'Test', 'Changed address', '[{"id":194,"quantity":1}]', 10, '');
    raise exception 'Changed retry accepted';
  exception when others then
    if sqlerrm not like 'Order reference already used%' then raise; end if;
  end;
  if (select count(*) from public.orders) <> count_before + 1 then raise exception 'Failed checkout left records'; end if;
  if has_table_privilege('anon', 'public.customers', 'SELECT') or
    has_table_privilege('anon', 'public.orders', 'SELECT') or
    has_function_privilege('anon', 'public.record_store_order(uuid,text,text,text,jsonb,numeric,text)', 'EXECUTE') or
    has_function_privilege('authenticated', 'public.record_store_order(uuid,text,text,text,jsonb,numeric,text)', 'EXECUTE') then
    raise exception 'Guest checkout bypasses server permissions';
  end if;
  update public.products set stock_quantity=0 where id=195;
  update public.products set stock_quantity=1 where id=195;
  if not exists (select 1 from public.notifications where title='Back in stock' and body like 'Organic White Butter%') then
    raise exception 'Stock return trigger failed';
  end if;
end $$;
rollback;
select 'PASS: atomic receipt, duplicate prevention, price validation, private data permissions, stock update; fixtures rolled back' as acceptance;
