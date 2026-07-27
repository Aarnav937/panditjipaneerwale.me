# Development Guide

## Single-branch workflow

This project uses **one source of truth**: the `main` branch of this repository.

| Do | Don't |
|----|--------|
| Edit `src/`, `public/`, configs on a feature branch | Maintain a second Desktop copy of the site |
| Open a PR → merge to `main` | Manually copy `dist/` into another branch |
| Let GitHub Actions build & deploy Pages | Run a “wipe main and paste dist” deploy |

### Day-to-day

```bash
git checkout -b feature/your-change
npm install
cp .env.example .env   # once
npm run dev
# ... code ...
npm test
npm run lint
npm run build
git add -A && git commit -m "feat: your change"
# open PR → merge to main → Actions deploys
```

### Live site

- Domain: `panditjipaneerwale.me` (`public/CNAME`)
- Host: GitHub Pages via `.github/workflows/deploy.yml`
- Trigger: push to `main` or manual `workflow_dispatch`

### Production env

Set repository secrets (Settings → Secrets and variables → Actions):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_SECRET`
- `VITE_GA_MEASUREMENT_ID` (optional)

The workflow passes these into `npm run build`. Missing secrets = site still deploys with limited backend features.

---

## Architecture (mental model)

```
Browser
  ├── React SPA (Vite)
  │     ├── Catalog from src/data/products.js
  │     ├── Cart in localStorage
  │     ├── WhatsApp checkout
  │     └── Admin UI (client secret gate)
  └── Supabase (optional)
        ├── customers, orders, addresses
        ├── wishlists, reviews
        └── notifications, push_subscriptions
```

There is **no custom Node server**. Checkout is WhatsApp; Supabase is CRM/persistence when configured.

---

## Quality gates

| Command | Expectation |
|---------|-------------|
| `npm test` | Vitest + Testing Library pass |
| `npm run lint` | ESLint clean |
| `npm run format:check` | Prettier clean |
| `npm run build` | Vite production build succeeds |

Run these before opening a PR.

---

## Products & images

- **Catalog:** `src/data/products.js` — never drop or invent product rows without an explicit product decision.
- **Images:** `public/images/products/` — prefer existing assets.
- **Sync tooling:** `npm run images:sync` (optional Gemini), `images:fix`, `images:report`. See `IMAGE_SYNC_GUIDE.md`.

---

## Admin access (dev)

1. Set `VITE_ADMIN_SECRET` in `.env`.
2. Restart `npm run dev`.
3. Open the cart and enter the secret in the address field (substring match unlocks a 24h session).

This is a UI gate only. Enforce real authorization with Supabase RLS in production.

---

## Restoring a known-good state

Local restore branch created before redesign work:

```text
restore-before-redesign-20260727
```

```bash
git checkout restore-before-redesign-20260727
# or create a new branch from it:
git checkout -b recover-from-restore restore-before-redesign-20260727
```

Do not force-push to `main` or re-deploy Pages without explicit approval.
