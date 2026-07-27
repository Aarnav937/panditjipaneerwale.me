# Image Sync Guide

Keep product photos in sync with `src/data/products.js` without hand-editing paths one by one.

## Prefer existing assets

- Source of truth for files: `public/images/products/`
- Only regenerate when an image is missing, broken, wrong aspect, or clearly low quality.
- New shots should look photorealistic and match the real product (paneer, spices, ghee, etc.).

## Scripts

| npm script | File | Purpose |
|------------|------|---------|
| `npm run images:sync` | `sync_by_name.js` | Import from `pending_images/` → optimize WebP → update product image paths |
| `npm run images:fix` | `fix_images.js` | If `image: ""` but `product-{id}.webp` exists, fill the path |
| `npm run images:report` | `generate_report.js` | Print which products have/missing images |

Removed: `preview_images.js`, `copy.js` (not portable).

## Sync workflow (`images:sync`)

1. Name files after products, e.g. `Fresh Paneer (500g).jpg` or `Bikaji Bhujia.png`.
2. Create folder `pending_images/` at repo root (gitignored).
3. Drop images there.
4. Add `GEMINI_API_KEY` to `.env` (optional AI verify; filename match runs first).
5. Run:

```bash
npm run images:sync
```

6. Check `public/images/products/` and `products.js`.
7. `npm run images:report` for a summary.

## Fix empty paths

```bash
npm run images:fix
```

Only rewrites empty `image` fields when a matching `product-{id}.webp` already exists.

## Report

```bash
npm run images:report
```

## Deploy note

Images must live under `public/` so Vite copies them into `dist/` on `npm run build`. GitHub Actions deploys that `dist` — no manual copy.
