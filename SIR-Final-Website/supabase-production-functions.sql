-- Normalize inventory color so product/size is uniquely addressable.
with ranked as (
  select ctid, row_number() over (partition by product_id, size order by updated_at desc, id desc) as rn
  from public.inventory
)
delete from public.inventory i
using ranked r
where i.ctid = r.ctid and r.rn > 1;

update public.inventory set color = '' where color is null;
alter table public.inventory alter column color set default '';
alter table public.inventory alter column color set not null;

-- SIR production order RPC
-- Run this once in Supabase SQL Editor after supabase-schema.sql.

create or replace function public.place_sir_order(
  p_name text,
  p_phone text,
  p_address text,
  p_notes text,
  p_items jsonb,
  p_total double precision,
  p_payment_method text,
  p_payment_screenshot text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_order_number text;
  v_item jsonb;
  v_product_id uuid;
  v_size text;
  v_qty integer;
  v_available integer;
  v_price numeric;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'Name and phone are required';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- Validate all stock before creating the order.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select id, price into v_product_id, v_price
    from public.products
    where code = v_item->>'id' and active = true;

    if v_product_id is null then
      raise exception 'Product % is unavailable', v_item->>'id';
    end if;

    v_size := coalesce(v_item->>'size', '');
    v_qty := greatest(1, coalesce((v_item->>'qty')::integer, 1));

    select quantity into v_available
    from public.inventory
    where product_id = v_product_id and size = v_size
    for update;

    if v_available is null then
      raise exception 'Size % is unavailable for %', v_size, v_item->>'id';
    end if;

    if v_available < v_qty then
      raise exception 'Only % left for % size %', v_available, v_item->>'id', v_size;
    end if;
  end loop;

  v_order_number := 'SIR-' || to_char(clock_timestamp(), 'YYMMDDHH24MISSMS');

  insert into public.orders
    (name, phone, address, notes, items_json, total, payment_method, payment_screenshot, status)
  values
    (p_name, p_phone, p_address, p_notes, p_items::text, p_total, p_payment_method, p_payment_screenshot, 'New')
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select id, price into v_product_id, v_price
    from public.products where code = v_item->>'id';

    v_size := coalesce(v_item->>'size', '');
    v_qty := greatest(1, coalesce((v_item->>'qty')::integer, 1));

    insert into public.order_items
      (order_id, product_id, product_code, product_name, size, color, quantity, unit_price, total_price)
    values
      (v_order_id, v_product_id, v_item->>'id', v_item->>'name', v_size,
       v_item->>'color', v_qty, v_price, v_price * v_qty);

    update public.inventory
    set quantity = quantity - v_qty, updated_at = now()
    where product_id = v_product_id and size = v_size;
  end loop;

  return v_order_id;
end;
$$;

grant execute on function public.place_sir_order(text,text,text,text,jsonb,double precision,text,text) to anon, authenticated;
