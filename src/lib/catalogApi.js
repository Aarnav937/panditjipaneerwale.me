import { supabase } from './supabase';

export async function loadStoreCatalog(localProducts) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('products').select('*').order('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Store catalog has not been configured.');
  return data.filter((row) => row.is_available !== false).map((row) => ({
    ...(localProducts.find((product) => product.id === row.id) || {}),
    ...row.storefront,
    id: row.id, name: row.name, category: row.category,
    price: Number(row.price), description: row.description, image: row.image,
    compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
  }));
}
