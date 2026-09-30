# سِرّ — SIR
A portfolio-ready fashion e-commerce concept.

Includes a cinematic horse-led hero, seven coded pieces, editorial product modals, size/quantity controls, wishlist, search, filters, cart, checkout, and WhatsApp order handoff.

WhatsApp order number: +20 120 457 7313.

Run with VS Code Live Server by opening `index.html`.


## Hero motion
The hero now uses a restrained cinematic motion system: slow camera breathing, drifting light/dust, and subtle pointer parallax. It is designed to feel like a living campaign image rather than a distracting animation.


## WhatsApp checkout
Checkout now opens WhatsApp Web directly with the complete order message, avoiding the `api.whatsapp.com` app-launch confirmation page.

## WhatsApp checkout — v7
The checkout uses WhatsApp's official click-to-chat URL with the full order message prefilled for **+20 12 04577313**. WhatsApp/browser security does not allow a website to press the final Send button automatically; the customer only needs to open the chat and tap **Send**.

## Admin Dashboard
Open `admin.html` to manage the SIR catalog, local order records, and store settings. Product changes are stored in browser localStorage and are reflected in the storefront opened on the same browser/origin.

This dashboard is the front-end/admin phase. It is not a secure server-side admin system yet; a production deployment should connect it to a database/API and real authentication before accepting customer data at scale.

## Supabase production connection
See `SUPABASE-FINAL-SETUP.md`. The browser uses the Supabase Publishable key only. Never expose a secret/service_role key.
