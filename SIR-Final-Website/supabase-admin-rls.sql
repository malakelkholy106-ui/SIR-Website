-- SIR Admin access policies
-- Run once after the main schema.
-- Create your admin user in Supabase Dashboard > Authentication > Users.

-- PRODUCTS
 drop policy if exists "Admin authenticated product access" on public.products;
 create policy "Admin authenticated product access"
 on public.products for all to authenticated using (true) with check (true);

-- INVENTORY
 drop policy if exists "Admin authenticated inventory access" on public.inventory;
 create policy "Admin authenticated inventory access"
 on public.inventory for all to authenticated using (true) with check (true);

-- ORDERS
 drop policy if exists "Admin authenticated order access" on public.orders;
 create policy "Admin authenticated order access"
 on public.orders for select to authenticated using (true);

 drop policy if exists "Admin authenticated order updates" on public.orders;
 create policy "Admin authenticated order updates"
 on public.orders for update to authenticated using (true) with check (true);

 drop policy if exists "Admin authenticated order deletes" on public.orders;
 create policy "Admin authenticated order deletes"
 on public.orders for delete to authenticated using (true);

-- ORDER ITEMS
 drop policy if exists "Admin authenticated order item access" on public.order_items;
 create policy "Admin authenticated order item access"
 on public.order_items for select to authenticated using (true);

grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.inventory to authenticated;
grant select, update, delete on public.orders to authenticated;
grant select on public.order_items to authenticated;
