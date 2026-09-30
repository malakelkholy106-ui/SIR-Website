-- SIR production database schema
-- Run this in Supabase SQL Editor before connecting the production API.
create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(12,2) not null default 0,
  category text not null default 'unisex',
  color text,
  material text,
  description text,
  story text,
  image_url text,
  limited boolean not null default false,
  limited_note text,
  sizes jsonb not null default '["S","M","L","XL"]'::jsonb,
  stock jsonb not null default '{"S":0,"M":0,"L":0,"XL":0}'::jsonb,
  track_stock boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  payment_method text not null,
  payment_reference text,
  status text not null default 'New',
  total numeric(12,2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id boolean primary key default true,
  whatsapp text,
  instapay text,
  email text,
  arabic_line text,
  footer_line text,
  established text,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.store_settings enable row level security;

-- Public storefront can read active products/settings.
create policy "public read active products" on public.products for select using (active = true);
create policy "public read settings" on public.store_settings for select using (true);

-- IMPORTANT: admin write policies should be created only after enabling Supabase Auth.
-- Do NOT make orders publicly writable/readable in production.
-- Use an authenticated admin role or server-side API for order creation and management.
