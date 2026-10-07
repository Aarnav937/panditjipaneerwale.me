-- Apply to the existing project. Preserve all existing tables and records.
create table if not exists public.store_admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.store_admins enable row level security;
revoke all on public.store_admins from anon, authenticated;
grant select on public.store_admins to authenticated;
grant all on public.store_admins to service_role;
create policy admin_own_membership on public.store_admins for select to authenticated
  using (email = lower(auth.jwt()->>'email') and auth.uid() is not null);
-- Populate the administrator allowlist privately in the Supabase project.
-- Do not commit personal administrator email addresses to the public repository.

create or replace function public.is_store_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.store_admins where email = lower(auth.jwt()->>'email')
  );
$$;
revoke all on function public.is_store_admin() from public, anon;
grant execute on function public.is_store_admin() to authenticated, service_role;

-- Remove the pre-existing allow-everyone policies, including duplicate policies.
do $$ declare p record; begin
  for p in select tablename, policyname from pg_policies
    where schemaname='public' and tablename in
      ('customers','orders','order_items','products','reviews','wishlists','addresses','push_subscriptions','notifications')
  loop execute format('drop policy %I on public.%I', p.policyname, p.tablename); end loop;
end $$;

alter table public.customers add column if not exists updated_at timestamptz default now();
alter table public.orders add column if not exists request_id uuid unique;
alter table public.orders add column if not exists updated_at timestamptz default now();
alter table public.products add column if not exists compare_at_price numeric;
alter table public.products add column if not exists storefront jsonb not null default '{}';
alter table public.orders add constraint store_order_status check (status in ('pending','confirmed','delivered','cancelled'));
create index if not exists store_orders_created_at on public.orders(created_at desc);
create index if not exists store_orders_phone on public.orders(customer_phone, created_at desc);

revoke all on public.customers, public.orders, public.order_items, public.products,
  public.reviews, public.wishlists, public.addresses, public.push_subscriptions, public.notifications from anon, authenticated;
grant all on public.customers, public.orders, public.order_items, public.products,
  public.reviews, public.wishlists, public.addresses, public.push_subscriptions, public.notifications to service_role;
grant usage, select on all sequences in schema public to service_role;
grant select on public.customers, public.orders, public.order_items to authenticated;
grant update(status, updated_at) on public.orders to authenticated;
create policy staff_customers_read on public.customers for select to authenticated using ((select public.is_store_admin()));
create policy staff_orders_read on public.orders for select to authenticated using ((select public.is_store_admin()));
create policy staff_orders_update on public.orders for update to authenticated
  using ((select public.is_store_admin())) with check ((select public.is_store_admin()));
create policy staff_order_items_read on public.order_items for select to authenticated using ((select public.is_store_admin()));

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant usage, select on sequence public.products_id_seq to authenticated;
create policy catalog_read on public.products for select to anon, authenticated using (true);
create policy staff_catalog_insert on public.products for insert to authenticated with check ((select public.is_store_admin()));
create policy staff_catalog_update on public.products for update to authenticated
  using ((select public.is_store_admin())) with check ((select public.is_store_admin()));
create policy staff_catalog_delete on public.products for delete to authenticated using ((select public.is_store_admin()));

-- Personal convenience features require an authenticated owner, never just a typed phone number.
alter table public.wishlists add column if not exists owner_id uuid default auth.uid() references auth.users(id);
alter table public.addresses add column if not exists owner_id uuid default auth.uid() references auth.users(id);
alter table public.push_subscriptions add column if not exists owner_id uuid default auth.uid() references auth.users(id);
grant select, insert, update, delete on public.wishlists, public.addresses, public.push_subscriptions to authenticated;
create policy wishlist_owner on public.wishlists for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy address_owner on public.addresses for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy push_owner on public.push_subscriptions for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

grant select, insert, update, delete on public.reviews to authenticated;
create policy reviews_own_read on public.reviews for select to authenticated
  using (user_email = (select auth.jwt()->>'email') or (select public.is_store_admin()));
create policy reviews_own_insert on public.reviews for insert to authenticated
  with check (user_email = (select auth.jwt()->>'email') and is_approved = false);
create policy reviews_staff_update on public.reviews for update to authenticated
  using ((select public.is_store_admin())) with check ((select public.is_store_admin()));
create policy reviews_staff_delete on public.reviews for delete to authenticated using ((select public.is_store_admin()));
-- Deliberately expose only display fields from approved reviews, never reviewer emails.
grant select(id, product_id, user_name, rating, comment, is_approved, created_at) on public.reviews to anon;
create policy reviews_approved_read on public.reviews for select to anon using (is_approved = true);
create or replace view public.approved_reviews with (security_invoker = true) as
  select id, product_id, user_name, rating, comment, is_approved, created_at
  from public.reviews where is_approved = true;
revoke all on public.approved_reviews from public;
grant select on public.approved_reviews to anon, authenticated;
grant select on public.notifications to anon, authenticated;
grant insert, update, delete on public.notifications to authenticated;
create policy broadcast_read on public.notifications for select to anon, authenticated using (target = 'all');
create policy notifications_staff_read on public.notifications for select to authenticated using ((select public.is_store_admin()));
create policy notifications_staff_insert on public.notifications for insert to authenticated with check ((select public.is_store_admin()));
create policy notifications_staff_update on public.notifications for update to authenticated
  using ((select public.is_store_admin())) with check ((select public.is_store_admin()));
create policy notifications_staff_delete on public.notifications for delete to authenticated using ((select public.is_store_admin()));

-- Atomic, server-only checkout. Guest callers cannot read/write customer/order tables.
create or replace function public.record_store_order(
  p_request_id uuid, p_phone text, p_name text, p_address text,
  p_items jsonb, p_expected_total numeric, p_notes text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  existing public.orders%rowtype;
  customer_uuid uuid;
  order_uuid uuid;
  canonical_items jsonb;
  order_total numeric;
  item_count integer;
  quantity_total integer;
begin
  if p_phone !~ '^[0-9]{10,15}$' or length(p_name) > 80 or
    length(trim(p_address)) not between 5 and 500 or length(p_notes) > 200 or
    jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Invalid order details';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_phone, 1));
  select * into existing from public.orders where request_id = p_request_id;
  if found then
    if existing.customer_phone <> p_phone or existing.customer_address <> p_address or
      existing.customer_name <> p_name or existing.notes <> p_notes or existing.total <> p_expected_total or
      (select jsonb_agg(jsonb_build_object('id', (x->>'id')::int, 'quantity', (x->>'quantity')::int) order by (x->>'id')::int) from jsonb_array_elements(existing.items) x) <>
      (select jsonb_agg(jsonb_build_object('id', (x->>'id')::int, 'quantity', (x->>'quantity')::int) order by (x->>'id')::int) from jsonb_array_elements(p_items) x) then
      raise exception 'Order reference already used';
    end if;
    return jsonb_build_object('id', existing.id, 'total', existing.total, 'items', existing.items, 'created_at', existing.created_at, 'status', existing.status);
  end if;
  if (select count(*) from public.orders where customer_phone = p_phone and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'Too many requests. Please contact the store on WhatsApp.';
  end if;
  select count(*), sum((x->>'quantity')::int) into item_count, quantity_total
    from jsonb_array_elements(p_items) x
    where (x->>'quantity')::int between 1 and 50 and (x->>'id')::int > 0;
  if item_count <> jsonb_array_length(p_items) or quantity_total > 50 or
    (select count(distinct x->>'id') from jsonb_array_elements(p_items) x) <> item_count then
    raise exception 'Invalid product quantities';
  end if;
  select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'price', p.price,
    'quantity', (x->>'quantity')::int, 'image', p.image, 'compareAtPrice', p.compare_at_price) order by p.id),
    sum(p.price * (x->>'quantity')::int), count(*)
  into canonical_items, order_total, item_count
  from jsonb_array_elements(p_items) x join public.products p on p.id = (x->>'id')::int
  where p.is_available = true;
  if item_count <> jsonb_array_length(p_items) then raise exception 'A product is unavailable. Refresh your cart.'; end if;
  if order_total <> p_expected_total then raise exception 'Prices have changed. Refresh the page and review your cart.'; end if;
  insert into public.customers(phone, name, address, updated_at) values(p_phone, p_name, p_address, now())
    on conflict(phone) do update set name=excluded.name, address=excluded.address, updated_at=now()
    returning id into customer_uuid;
  insert into public.orders(request_id, customer_id, customer_phone, customer_name, customer_address, items, total, notes, status)
    values(p_request_id, customer_uuid, p_phone, p_name, p_address, canonical_items, order_total, p_notes, 'pending')
    returning id into order_uuid;
  insert into public.order_items(order_id, product_id, product_name, quantity, unit_price)
    select order_uuid, (x->>'id')::int, x->>'name', (x->>'quantity')::int, (x->>'price')::numeric
    from jsonb_array_elements(canonical_items) x;
  return jsonb_build_object('id', order_uuid, 'total', order_total, 'items', canonical_items, 'created_at', now(), 'status', 'pending');
end $$;
revoke all on function public.record_store_order(uuid,text,text,text,jsonb,numeric,text) from public, anon, authenticated;
grant execute on function public.record_store_order(uuid,text,text,text,jsonb,numeric,text) to service_role;
