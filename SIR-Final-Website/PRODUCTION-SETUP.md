# SIR — Production Launch Checklist

This package contains the latest storefront + admin build and the production database schema.

## Included now
- Cinematic SIR storefront and responsive layout
- Home / Shop / Collection / Lookbook / About sections
- 7 current products and product detail modal
- Search, filters, wishlist, cart and checkout
- COD + InstaPay selection
- WhatsApp click-to-chat order handoff
- Local order records and admin order management
- Product CRUD
- Image upload in admin
- Limited-product badges
- Inventory by S/M/L/XL
- Low-stock / out-of-stock indicators
- Order search/filter and CSV export
- Store settings
- Vercel static deployment config
- SEO robots/sitemap starter
- Supabase production SQL schema

## Two account-dependent steps remain before a real public launch
1. Connect a real Supabase project and enable Supabase Auth for the admin.
2. Connect a real payment provider if you want online payment instead of COD/InstaPay manual confirmation.

The current browser-only mode intentionally uses localStorage so the project can be opened immediately in VS Code without credentials. Do not treat localStorage as a production database or as secure admin authentication.

## Run locally
Open this folder in VS Code and use Live Server on `index.html`.
Open `admin.html` for the dashboard.

## Deploy
The project is static and can be deployed to Vercel. Replace the placeholder domain in `sitemap.xml` after the real domain is known.
