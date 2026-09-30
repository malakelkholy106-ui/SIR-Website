# SIR — Supabase Final Connection

The storefront and admin dashboard now use Supabase when configured. The storefront can read the live catalog and create orders through the secure `place_sir_order` RPC. The admin dashboard uses Supabase Auth and authenticated database access.

## 1) Add the Publishable Key

Open `supabase-config.js` and replace:

`PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE`

with the **Publishable key** from your Supabase project (Dashboard → Connect, or Settings → API Keys).

Do **not** use a secret/service_role key in this browser project.

## 2) Run the final SQL

You already created the main tables and the seven products. Now open Supabase → SQL Editor and run:

`supabase-production-functions.sql`

then:

`supabase-admin-rls.sql`

## 3) Create the Admin user

In Supabase Dashboard → Authentication → Users, create the email/password user that will be used for the SIR Admin Dashboard.

Then open `admin.html`. It will show the SIR Admin sign-in screen.

## 4) Test

- `index.html`: products should load from Supabase.
- Add a product to bag and place a test order.
- The order should appear in Supabase `orders` and `order_items`.
- Inventory is decremented by the `place_sir_order` database function.
- `admin.html`: sign in and verify Products / Orders / Inventory.

## Security note

The browser only uses the Supabase Publishable key. Never put a Supabase secret/service_role key in `supabase-config.js` or any file deployed to the public website.


## 5) Required before public launch: lock down Admin access

The earlier `supabase-admin-rls.sql` grants management access to every authenticated account. Before making the storefront public:

1. Confirm the Admin account exists in Supabase Authentication → Users.
2. In SQL Editor, run the entire `supabase-secure-admin.sql` file after replacing `YOUR_ADMIN_EMAIL_HERE` with that Admin account's email. This restricts product, inventory, and order management to accounts listed in `admin_users` and refreshes the API schema cache.
3. In Supabase Authentication settings, disable new user sign-ups.

Do not launch while the broad authenticated policies are still active.
