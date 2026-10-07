-- Preserve stock return announcements using the actual notification schema.
create or replace function public.notify_stock_return() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if OLD.stock_quantity = 0 and NEW.stock_quantity > 0 then
    insert into public.notifications(title, body, target)
      values ('Back in stock', NEW.name || ' is back in stock!', 'all');
  end if;
  return NEW;
end $$;
alter function public.update_updated_at() set search_path='';
