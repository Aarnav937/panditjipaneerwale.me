# Pandit Ji Paneer Wale

Modern e-commerce storefront for **[panditjipaneerwale.me](https://panditjipaneerwale.me)** — dairy, spices, and grocery delivery ordered via WhatsApp.

**Stack:** React 18 · Vite 5 · Tailwind CSS · Framer Motion · Supabase · GitHub Pages

---

## Features

| Area | What shoppers / staff get |
|------|---------------------------|
| **Catalog** | Supabase prices and availability, with local catalog metadata for categories, search and filters |
| **Cart** | Local cart with quantity limits (50 items / 50kg / 50L) |
| **Checkout** | Server-validated order receipt, followed by a WhatsApp message for delivery confirmation (no payment gateway) |
| **Wishlist** | Heart products; syncs to Supabase when logged in |
| **Reviews** | Product ratings & review section |
| **Auth** | Guest checkout details; administrator Supabase email/password login |
| **Addresses** | Saved delivery addresses (`AddressManager`) |
| **i18n** | Multi-language UI (`LanguageContext` + `translations.js`) |
| **Push** | Web push + service worker (`public/sw.js`) |
| **Admin** | Verified Supabase login and database administrator allowlist; orders, sales reports, customers, products and inventory |

---

## One repo, one branch, one deploy story

There is **no** separate “source branch → manually copy `dist` to main” workflow.

| What | Where |
|------|--------|
| Source of truth | This repository’s `main` branch (`src/`, `public/`, configs) |
| Build | GitHub Actions runs `npm ci` → `npm run build` |
| Live site | GitHub Pages serves the built `dist/` artifact |
| Domain | `public/CNAME` → `panditjipaneerwale.me` |

**Deploy flow:** push (or merge) to `main` → workflow `.github/workflows/deploy.yml` builds → deploys Pages.

Do not maintain parallel Desktop folders or hand-copy `dist` into another branch.

---

## Quick start (local)

### Requirements

- Node.js **20+**
- npm 10+ (ships with Node)

### Install & run

```bash
npm install
cp .env.example .env   # then fill in values (see below)
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Production build (local check)

```bash
npm run build
npm run preview
```

---

## Environment variables

Create a `.env` file in the project root (never commit real secrets).

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | For DB/auth | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For DB/auth | Supabase **anon** public key (not service_role) |
| `VITE_GA_MEASUREMENT_ID` | Optional | Google Analytics measurement ID |
| `GEMINI_API_KEY` | Optional | Only for `npm run images:sync` (Node script, not the browser) |

Without Supabase configuration the catalog remains available for browsing, but checkout reports that the order could not be saved and keeps the cart. Production deployment fails if either required Supabase setting is absent.

**Important:** Any `VITE_*` value is embedded in the public JS bundle. Never put `service_role` or private API keys in `VITE_*`.

---

## GitHub Actions secrets (production)

The deploy workflow injects env vars at build time from **repository secrets**.

1. Open the GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** for each:

| Secret name | Same as local |
|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_GA_MEASUREMENT_ID` | Optional GA id |

3. Push to `main` (or run **Actions** → **Deploy to GitHub Pages** → **Run workflow**)

If either required Supabase secret is missing, the production build fails before deploying. A successful build still needs an actual checkout/database verification; it alone does not prove backend availability.

Also enable **Pages**: Settings → Pages → Source = **GitHub Actions**.

---

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm test` | Vitest unit/component tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run images:sync` | Match pending images → products (needs `GEMINI_API_KEY`) |
| `npm run images:fix` | Fill empty image paths when files exist on disk |
| `npm run images:report` | Print product ↔ image status report |

---

## Project layout

```
├── .github/workflows/deploy.yml   # build + GitHub Pages
├── public/                        # static assets, CNAME, sw.js, product images
├── src/
│   ├── App.jsx                    # storefront shell
│   ├── components/                # UI (store + admin/)
│   ├── context/                   # Auth, Admin, Wishlist, Language, Notifications
│   ├── data/products.js           # FULL product catalog (do not drop products)
│   ├── data/translations.js
│   └── lib/                       # supabase, cart helpers, push
├── sync_by_name.js / fix_images.js / generate_report.js  # image tooling
├── package.json
└── vite.config.js
```

---

## Customization

| Task | File / place |
|------|----------------|
| Products (prices, names, images) | Supabase products via the admin dashboard; keep `src/data/products.js` in sync for local fallback |
| Product photos | `public/images/products/*` |
| Brand colors | `tailwind.config.js` |
| Contact / WhatsApp | `Footer.jsx`, `Cart.jsx`, `FloatingWhatsApp.jsx` |
| Copy / i18n strings | `src/data/translations.js` |

**Rule:** Keep every existing product. Prefer existing images under `public/images/products/`.

---

## Security notes (short)

- Administrator access requires a verified Supabase user and membership of the private `store_admins` database table. Browser storage and client phrases grant no access.
- Do not commit `.env`. Use `.env.example` as the template.
- Never place a service-role key in frontend variables. The checkout Edge Function uses its server environment to validate and save orders atomically.
- Setup, operating instructions and remaining email/push limitations are documented in [the backend guide](docs/store-backend.md).

---

## License

Private business site — all rights reserved.
