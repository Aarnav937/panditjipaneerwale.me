# Website security review — 22 October 2026

## Scope and findings

The production storefront is static React on GitHub Pages. Customer/order storage and the `create-order` function run on Supabase. The checked dependency lockfile and deployment workflow do not use Railway, Zeabur, PHP, WordPress/RankMath/Updraft, LiteLLM, Tensorlake, SubQuery, ConnectWise, or the OVHcloud CLI. This is a website assessment, not a forensic clearance of every application or account on the developer's computer.

Node's October security update applies to the build environment. `.nvmrc` selects 24.22.1; the old workflow selected unsupported Node 20. A checksum-verified official Windows runtime was also installed alongside the existing runtime; the machine-wide PATH was not changed.

The initial npm audit reported 27 affected dependency entries (2 critical, 18 high, 6 moderate, 1 low). These are package/advisory-chain counts, not proof of exploitation or 27 independent attacks. Vite, Vitest, Sharp and compatible transitive dependencies were updated; Supabase JS is pinned to 2.118.0. Sharp is a development/image-processing tool, not a browser dependency. All direct dependency versions are exact and the lockfile is committed.

## Remaining development-only advisory

`GHSA-vfj7-8cjw-p6xm` affects `braces <=3.0.3`; upstream has no patched release. Tailwind 3 uses it through chokidar/fast-glob/micromatch. These five audit entries share one root advisory. The input globs are controlled by this repository, and the code is not deployed to browsers or used by the order function. A Tailwind 4 migration would change the styling toolchain and is outside this security patch.

`npm run security:audit` allows only that exact advisory and chains reaching only it, only when every installed node is a development dependency. The exception expires 22 November 2026. New advisories, production exposure, invalid audit results and registry failures block deployment. The raw `npm audit` therefore still reports five high entries; `npm audit --omit=dev` reports zero known vulnerabilities at review time. This exception must not be described as zero vulnerabilities overall.

## Supply-chain controls

- Package lifecycle scripts are disabled by `.npmrc` and explicit `npm ci --ignore-scripts`.
- GitHub Actions use verified official release commit SHAs; their JavaScript runtimes use Node 24. The Pages artifact action also pins its nested upload action.
- Build jobs have read-only repository permissions and no persisted Git credential. Only the deployment job receives Pages/OIDC permissions.
- Every deployment runs the dependency audit, audit regression tests, lint, application tests and production build.
- Dependabot proposes weekly npm and Actions updates; updates are not automatically merged. Normal npm updates have a three-day cooldown.
- Development and preview servers bind to loopback, not all network interfaces.

## Backend checks

Live checks confirmed RLS on all public base tables, a security-invoker approved-review view, no anonymous SELECT grants on private customer/order/admin/address/subscription tables, and no browser-role EXECUTE grant on `record_store_order`. A simulated signed-in non-admin saw zero customers, orders, items and admin memberships. `create-order` remains JWT-verified.

The production instance reported Postgres 17.6. The owner approved the available upgrade to 17.11 after seeing Supabase's up-to-one-hour downtime and no-downgrade warning. Preflight found no ltree indexes, float GiST indexes, custom selectivity operators, or public binary columns requiring the documented migration repairs. Before maintenance: 20 orders, 32 order items, 12 customers, 161 products, 4 admin memberships. Actual completion and data preservation must be verified after the managed upgrade; initiating it is not completion.

Supabase's leaked-password protection is disabled and requires Pro or above. This Free project was not upgraded to a paid plan. GraphQL schema-discovery warnings are not proof of row access; the RLS denial checks above test the actual private-data boundary.

## Historical credential

A scan of 99 current tracked text files found no high-confidence provider token, private key, or service-role JWT. A separate scan of 72 historical text blobs found a Google `GEMINI_API_KEY` in an old `.env` blob reachable from a public December 2025 commit. No key value is recorded in this report. Google's own read-only models endpoint rejected that key with HTTP 400 `INVALID_ARGUMENT` and an invalid-key error on 22 October 2026. This establishes that it was not accepted by that endpoint; it does not establish historical usage or precisely when it was disabled. The current deployment does not receive that key. Repository history was not rewritten.

## Automatic features and limits

The later [store operations follow-up](store-operations-2026-10-22.md) supersedes this section's scheduler and browser-push implementation status; its external email/device acceptance limits remain explicit.

Checkout stores order requests centrally and uses stable request IDs to prevent duplicate retries; server-side database prices remain authoritative. Stock-return notifications are database-triggered. The existing daily offers are generated by the frontend date seed when the app loads, not by a backend midnight cron. WhatsApp messages still require the customer to send them. Browser push/email sending, backup scheduling and successful real administrator sign-in must not be claimed verified by dependency tests alone.

## Sources

## Completion evidence

The approved upgrade completed successfully: the management API reports `ACTIVE_HEALTHY`, SQL reports Postgres 17.11, and the dashboard shows 17.11.0.003 (latest). PostgREST is now 14.18. Auth's public health endpoint returned HTTP 200.

All baseline counts were preserved. The rollback acceptance suite passed on the upgraded database, covering atomic receipts, duplicate prevention, tampered totals, invalid quantities/products, private-data permissions and the stock-return notification trigger. A separate real HTTP request to the deployed `create-order` function returned HTTP 200 with an AED 10 receipt; an identical retry returned HTTP 200 with the same ID. The precisely identified synthetic order/customer/items were removed, leaving the original 20 orders, 32 items, 12 customers and 161 products. No WhatsApp message was sent.

Anonymous HTTP reads of customers, orders and admin membership all returned HTTP 401. A signed-in non-admin role simulation again returned zero private records. Invalid checkout input returned HTTP 400; a request without authentication returned HTTP 401.

The website patch is commit `17605b7`. Its GitHub Pages deployment succeeded: https://github.com/Aarnav937/panditjipaneerwale.me/actions/runs/39753349022 . Live HTML now serves `index-D9qo2M5W.js` and `index-BkE0UujT.css`. Verification: 68 application tests, 3 security-audit regression tests, lint, production build, a native Sharp smoke test, lockfile registry/integrity checks and browser cart smoke checks passed.

Four administrator email memberships are authorized, but only one corresponding Auth/password account exists. Actual successful administrator UI sign-in remains unverified; the other three passwords/accounts need owner completion. Do not describe all four logins, outgoing email, web push or a new midnight backend scheduler as configured by this patch.

## References

- https://nodejs.org/en/blog/vulnerability/october-2026-security-releases
- https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes
- https://supabase.com/docs/guides/platform/upgrading
- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://docs.github.com/en/actions/reference/security/secure-use
- https://blog.railway.com/p/security-disclosure-wednesday-october-21st
- https://github.com/ovh/ovhcloud-cli/security/advisories/GHSA-862f-55f5-vmvw
