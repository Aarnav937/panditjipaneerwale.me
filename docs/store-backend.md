# Store order backend

Guest checkout saves a pending order request centrally before opening WhatsApp. The customer still needs to send the message and the store needs to confirm delivery. No payment gateway or automatic WhatsApp delivery confirmation is provided.

## Data and checkout

- Supabase stores customers by normalized phone number, orders, and order items. The two existing historical orders are preserved.
- `create-order` validates input, allows the storefront and local preview origins, and invokes the server-only `record_store_order` database function.
- Prices, product names and availability come from the database. Client-supplied totals must match; the server does not accept client-supplied item prices.
- The database writes customer, order and items in one transaction. A retry with the same request UUID returns the existing receipt; altered retries fail. Five new requests per phone per ten minutes are allowed.
- Checkout failures keep the cart and show an error. Saved orders include a server reference in the WhatsApp message and a visible link if the browser blocks opening WhatsApp.
- Browser history retains the latest 20 entries as a convenience. Central records have no automatic expiry or 20-order cap. Old browser-only records are not automatically uploaded or recoverable from other devices.
- Pending requests do not count as confirmed revenue and do not automatically deduct stock. Staff update their status after confirmation.

## Administrator access

Open **Admin portal** in the storefront footer and use **Password** login. Accounts must exist in Supabase Auth and their verified email must be in `public.store_admins`. Enter approved addresses privately in the database; do not commit personal administrator emails into this repository. New passwords must be entered by the account owner through Supabase's user creation form.

Orders can be searched by customer, phone, address or reference, filtered by status, and exported as CSV. Reports offer Today in Abu Dhabi, rolling periods, and All time. Confirmed and delivered orders count as sales; pending and cancelled requests do not. Queries fetch all database pages instead of silently stopping at the Supabase response cap. Use Refresh for new records; reports do not promise instantaneous updates.

Anonymous visitors cannot read customer/order tables. An authenticated user outside the administrator allowlist sees no customer/order records. A typed guest phone number and obsolete `admin_session` storage do not authenticate anyone. Guest convenience details remain local. Approved review content is public without exposing reviewer email addresses.

## Deployment and catalog maintenance

1. Apply `supabase/store-backend.sql` once against the existing store schema; this is a one-time migration, not a repeatedly executed setup script. Apply `supabase/repair-stock-trigger.sql` to repair the inherited stock trigger.
2. Keep the private administrator allowlist in Supabase. No browser admin secret is used.
3. Seed or synchronize the catalog using `node scripts/seed-store-catalog.mjs`, then review and execute `supabase/store-catalog.sql` in Supabase. Seeding updates names, prices and metadata while preserving existing availability and stock. Do not overwrite deliberate live price edits with stale fallback prices.
4. Deploy `supabase/functions/create-order/index.ts` with JWT verification enabled as recorded in `supabase/config.toml`. It uses Supabase's native server URL and service-role environment variables; never copy the service-role key into the frontend or Pages secrets.
5. Set GitHub repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the existing project URL and legacy browser-safe anon JWT. The current function gateway expects JWTs; replacing this with a newer publishable key needs gateway/auth compatibility work.
6. Push to `main`; Pages runs lint, tests and build. Verify a real checkout receipt against its database row and verify administrator access after deployment.

After any price change, the database is authoritative. Staff dashboard changes are loaded by shoppers on their next page load. The local fallback catalog supports browsing when the database is temporarily unavailable; checkout rejects stale totals rather than charging an unexpected price.

## Verification and operational limits

`supabase/verify-order-transaction.sql` tests receipt creation, duplicate prevention, price/quantity validation, anonymous permissions and stock changes inside a transaction that is rolled back. Component tests cover missing backend, failed checkout, receipt handling, retries, administrator checks and sales calculations.

Password login does not require an email sender. Supabase's default sender is restricted; a production SMTP service remains necessary for reliable email codes, invitations and password-reset emails to all staff. Push delivery also requires VAPID/server push setup and is not enabled by this checkout change. Restoring the database does not configure a backup policy; use the existing CSV exports for operational records and configure proper database backups separately.

Order requests are recorded when checkout is submitted, even if the customer abandons the WhatsApp message. Staff should cancel abandoned requests. The public checkout endpoint has input limits and per-phone rate limits; it does not verify ownership of a guest phone number. Stronger bot protection or phone verification would be a separate change.
