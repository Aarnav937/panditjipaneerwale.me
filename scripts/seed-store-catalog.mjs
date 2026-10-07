import { writeFileSync } from 'node:fs';
import { products } from '../src/data/products.js';

const rows = products.map(({ id, name, category, price, description, image, compareAtPrice, ...metadata }) => ({
  id, name, category, price, description, image, compare_at_price: compareAtPrice ?? null, storefront: metadata,
}));
const sql = `-- Catalog generated from src/data/products.js. Preserve existing stock settings.
insert into public.products(id,name,category,price,description,image,compare_at_price,storefront)
select id,name,category,price,description,image,compare_at_price,storefront
from jsonb_to_recordset($catalog$${JSON.stringify(rows)}$catalog$::jsonb)
as p(id integer,name text,category text,price numeric,description text,image text,compare_at_price numeric,storefront jsonb)
on conflict(id) do update set name=excluded.name,category=excluded.category,price=excluded.price,
description=excluded.description,image=excluded.image,compare_at_price=excluded.compare_at_price,storefront=excluded.storefront,updated_at=now();
select setval('public.products_id_seq', (select max(id) from public.products));
`;
writeFileSync(new URL('../supabase/store-catalog.sql', import.meta.url), sql);
console.log(`Prepared ${rows.length} catalog products.`);
