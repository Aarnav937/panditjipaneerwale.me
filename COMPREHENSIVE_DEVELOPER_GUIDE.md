# Comprehensive Developer Guide

Pandit Ji Paneer Wale — full reference for the single-repo, GitHub Pages storefront.

---

## 1. Project overview

| Item | Detail |
|------|--------|
| Live URL | https://panditjipaneerwale.me |
| App type | React SPA (client-only) |
| Catalog | ~158 products in `src/data/products.js` |
| Checkout | WhatsApp message with order details |
| Backend | Optional Supabase (auth, CRM, orders, reviews, push) |
| Deploy | GitHub Actions → GitHub Pages |

**Non-negotiable:** Keep all existing products and prefer existing product images under `public/images/products/`.

---

## 2. Technology stack

| Layer | Choice |
|-------|--------|
| UI | React 18 |
| Bundler | Vite 5 |
| Styles | Tailwind CSS 3 + PostCSS |
| Motion | Framer Motion |
| Icons | Lucide React |
| BaaS | Supabase JS client |
| Hosting | GitHub Pages |
| Tests | Vitest + React Testing Library |
| Lint/format | ESLint 8 + Prettier |

---

## 3. Architecture & file structure

```
panditjipaneerwale.me-main/
├── .github/workflows/deploy.yml
├── .env.example
├── public/
│   ├── CNAME
│   ├── sw.js
│   └── images/products/     # product photos (source of truth for assets)
├── src/
│   ├── main.jsx             # providers + React root
│   ├── App.jsx              # catalog, cart, lazy panels
│   ├── index.css
│   ├── components/          # storefront UI
│   │   └── admin/           # admin dashboard panels
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── AdminContext.jsx
│   │   ├── WishlistContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── LanguageContext.jsx
│   ├── data/
│   │   ├── products.js      # catalog
│   │   └── translations.js
│   └── lib/
│       ├── cart.js          # pure cart logic (tested)
│       ├── supabase.js
│       └── pushNotifications.js
├── fix_images.js
├── sync_by_name.js
├── generate_report.js
├── package.json
├── vite.config.js
├── tailwind.config.js
└── docs: README, DEVELOPMENT_GUIDE, TROUBLESHOOTING, IMAGE_SYNC, this file
```

### Provider tree

```
AuthProvider → AdminProvider → WishlistProvider → NotificationProvider → LanguageProvider → App
```

### Lazy-loaded UI

Cart, QuickViewModal, AdminDashboard, AuthModal — code-split for faster first paint.

---

## 4. Getting started

```bash
npm install
cp .env.example .env
# edit .env
npm run dev
```

See **README.md** for env var table and GitHub Secrets setup.

---

## 5. Core features (code map)

| Feature | Primary files |
|---------|----------------|
| Product grid / search | `App.jsx`, `ProductCard.jsx`, `products.js` |
| Cart limits / add/remove | `src/lib/cart.js`, `App.jsx`, `Cart.jsx` |
| WhatsApp order | `Cart.jsx`, `FloatingWhatsApp.jsx` |
| Wishlist | `WishlistContext.jsx`, `Wishlist.jsx` |
| Reviews | `ReviewSection.jsx`, admin `ReviewModerator.jsx` |
| Guest / OTP auth | `AuthContext.jsx`, `AuthModal.jsx` |
| Addresses | `AddressManager.jsx` |
| i18n | `LanguageContext.jsx`, `translations.js` |
| Push | `pushNotifications.js`, `public/sw.js` |
| Admin shell | `AdminContext.jsx`, `admin/AdminDashboard.jsx` |
| Admin panels | ProductManager, InventoryManager, CustomerDatabase, AnalyticsDashboard, NotificationManager, ReviewModerator |

### Admin unlock

`AdminContext` reads `import.meta.env.VITE_ADMIN_SECRET`. Typing that phrase (substring, case-insensitive) into the cart address field stores a 24h `localStorage` session. **Not** a substitute for Supabase RLS.

### Supabase tables (when used)

`customers`, `orders`, `order_items`, `addresses`, `wishlists`, `reviews`, `notifications`, `push_subscriptions`, `products` (admin).

If env is missing, `src/lib/supabase.js` exports `supabase = null` and helpers soft-fail.

---

## 6. Making changes safely

1. Branch from latest `main` (or your approved work branch).
2. Change only what you need; keep all products.
3. `npm test && npm run lint && npm run build`
4. PR → merge to `main` → Actions deploys.
5. Do **not** push to live without approval when working on redesign branches.

Restore point before redesign:

```text
restore-before-redesign-20260727
```

---

## 7. Adding a product

1. Add a row to `src/data/products.js` with unique `id`, `name`, `category`, `price`, `image`, `description`.
2. Place image at `public/images/products/product-{id}.webp` (or matching path).
3. Ensure `category` is in `categories` (or add it).
4. Run `npm run images:report` to verify.

Do not delete existing catalog entries without an explicit business decision.

---

## 8. Image tooling

| Script | npm | Role |
|--------|-----|------|
| `sync_by_name.js` | `images:sync` | Drop files in `pending_images/`, match to products (filename + optional Gemini) |
| `fix_images.js` | `images:fix` | Fill empty `image: ""` when file exists |
| `generate_report.js` | `images:report` | Coverage report |

Removed legacy one-offs: `preview_images.js`, `copy.js` (machine-specific paths).

Details: **IMAGE_SYNC_GUIDE.md**.

---

## 9. Internationalization

- `LanguageContext` stores language in `localStorage`.
- Strings in `src/data/translations.js`.
- RTL applied when language requires it.

---

## 10. Styling

- Tailwind with brand tokens in `tailwind.config.js` (orange/saffron/gold/cream).
- Dark mode: `class` strategy on `<html>`.
- Global styles: `src/index.css`.

---

## 11. Testing & verification

| Command | What it covers |
|---------|----------------|
| `npm test` | Products integrity, cart math, ProductCard render, Auth guest login, Admin gate |
| `npm run lint` | ESLint (React + hooks) |
| `npm run format:check` | Prettier |
| `npm run build` | Production bundle |

Manual smoke (still useful):

1. Home loads, products visible.
2. Add to cart → toast → open cart.
3. Place order opens WhatsApp.
4. Wishlist heart toggles.
5. Admin secret opens dashboard (with env set).

---

## 12. Deployment workflow

```
push to main
    → checkout
    → npm ci
    → npm run build  (with VITE_* from GitHub Secrets)
    → upload dist artifact
    → deploy-pages
```

**Configure once:**

1. Pages: Settings → Pages → Source = GitHub Actions  
2. Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_SECRET`, optional `VITE_GA_MEASUREMENT_ID`

There is no manual dist copy step.

---

## 13. Troubleshooting

See **TROUBLESHOOTING_GUIDE.md**.

---

## 14. Best practices

- One repo; don’t keep parallel “main/source/master” folder trees as active workspaces.
- Never commit `.env` or service_role keys.
- Prefer pure helpers in `src/lib/` for logic you want tested.
- Keep PRs small; run test + lint + build before merge.
- Product catalog changes are business-critical — double-check prices and images.
