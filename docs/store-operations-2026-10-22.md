# Store operations verification - 22 October 2026

This follow-up adds backend schedules and reliable store operations after the security release. It does not claim external email delivery or an administrator login has succeeded before those flows are exercised.

## Implemented and checked

- Supabase persists eight featured product IDs per Abu Dhabi business day. Paneer and configured launch promotions stay first; the remaining slots rotate deterministically. The scheduled refresh runs at 20:00 UTC, midnight Abu Dhabi. Existing open pages refresh on business-day changes and visibility wake; a one-minute feature retry handles cron timing. Product selling prices are preserved.
- Public announcements use the real `title/body/target` schema. Guests can read broadcasts; read/dismiss state stays on each device. The phone notification panel is rendered outside the filtered header, has a close button, and fits the viewport.
- Browser push requires an explicit opt-in. The server persists validated vendor endpoints and subscription keys. Browser roles cannot write subscriptions directly. Server-only VAPID keys remain in Vault.
- Announcements and stock-return broadcasts enqueue durable deliveries. A once-per-minute worker claims bounded batches, retries temporary failures, removes expired subscriptions and records terminal failures. Empty queues do not invoke the Edge Function.
- Worker requests use HMAC signatures valid for 90 seconds. Supabase's extension-owned `pg_net` queue has PUBLIC grants which the project postgres role cannot revoke; reusable secrets are therefore never placed in its headers. The earlier worker secret was rotated after changing this design, and no legacy-token request remained queued. VAPID private keys never entered that queue.
- Product/inventory screens no longer replace failed database requests with sample stock or claim local-only edits were saved. Orders, customers, analytics and operations status refresh while visible. Save/update/delete operations require actual returned database rows.
- Password login is retained; email-code login reports real provider errors and requires server authorization before showing administrator data. Missing-backend customer login fails closed.

## Evidence

- 82 application tests across 22 files, three audit regression tests, lint and production build passed. Dependency audit retains the documented development-only braces exception through 22 November; no unaccepted advisory was reported.
- `supabase/verify-store-automations.sql` checks stable daily selection, pinned promotions even when every product has a reference price, rotation, worker permissions, subscription mutation denial, announcement queuing and retry/delivery state. Fixtures are rolled back.
- Deployed functions: `push-subscription` v1 and `dispatch-push` v2, JWT verification enabled. A private worker fixture produced HTTP 200 and rejected its loopback destination before any delivery. An unsigned direct worker request returned 401. No customer broadcast was sent for testing.
- Baseline records preserved: 20 orders, 32 order items, 12 customers, 161 products. Exactly identified committed worker fixtures were removed. Existing checkout's independent transaction suite and HTTP idempotency test had passed after the Postgres 17.11 upgrade.
- Phone preview checked at 390 x 844: no horizontal overflow, notification panel within viewport, close/reopen working, administrator code form reachable.
- Security advisors still note intentionally public catalog/broadcast schema discovery, RLS-denied private worker tables, and the Free-plan leaked-password-protection limitation. These are not represented as zero warnings.

## Owner-dependent acceptance still outstanding

Brevo replaces the unusable Resend sign-in. Complete the free account's sender/domain setup and SMTP credential handoff to Supabase; do not buy a plan or paste credentials into chat. Verify actual code receipt and sign-in with all four authorized admin emails. Only one matching Auth account existed at the last count; allowlisting is not account creation.

An actual device must opt into browser notifications before end-to-end push receipt can be proven. Server configuration and private worker execution are verified; real device receipt is not. Backup scheduling has not been newly configured by this change. WhatsApp checkout prepares a message which the customer must send.
