-- SIR — Secure Admin RLS
-- One-time setup. Replace the placeholder email with the email used for your Admin account, then Run.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Replace ONLY the email below. Do not put any password or secret key here.
insert into public.admin_users (user_id)
select id from auth.users
where email = 'YOUR_ADMIN_EMAIL_HERE'
on conflict (user_id) do nothing;

create or replace function public.is_sir_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid()
  );
$$;

grant execute on function public.is_sir_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
drop policy if exists "Admin can read own admin record" on public.admin_users;
create policy "Admin can read own admin record"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

-- Remove broad authenticated access from the earlier setup.
drop policy if exists "Admin authenticated product access" on public.products;
drop policy if exists "Admin authenticated inventory access" on public.inventory;
drop policy if exists "Admin authenticated order access" on public.orders;
drop policy if exists "Admin authenticated order updates" on public.orders;
drop policy if exists "Admin authenticated order deletes" on public.orders;
drop policy if exists "Admin authenticated order item access" on public.order_items;
drop policy if exists "SIR admin manages products" on public.products;
drop policy if exists "SIR admin manages inventory" on public.inventory;
drop policy if exists "SIR admin reads orders" on public.orders;
drop policy if exists "SIR admin updates orders" on public.orders;
drop policy if exists "SIR admin deletes orders" on public.orders;
drop policy if exists "SIR admin reads order items" on public.order_items;

create policy "SIR admin manages products"
on public.products for all to authenticated
using (public.is_sir_admin()) with check (public.is_sir_admin());

create policy "SIR admin manages inventory"
on public.inventory for all to authenticated
using (public.is_sir_admin()) with check (public.is_sir_admin());

create policy "SIR admin reads orders"
on public.orders for select to authenticated
using (public.is_sir_admin());

create policy "SIR admin updates orders"
on public.orders for update to authenticated
using (public.is_sir_admin()) with check (public.is_sir_admin());

create policy "SIR admin deletes orders"
on public.orders for delete to authenticated
using (public.is_sir_admin());

create policy "SIR admin reads order items"
on public.order_items for select to authenticated
using (public.is_sir_admin());

-- Keep customer order creation through the secure RPC.

notify pgrst, 'reload schema';
