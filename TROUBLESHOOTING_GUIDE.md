# Troubleshooting Guide

## Deploy model (read this first)

| Correct | Outdated (do not use) |
|---------|------------------------|
| Code lives on `main` | Separate `source` branch for edits |
| Actions builds `npm run build` | Manually copy `dist` onto `main` |
| Pages source = GitHub Actions | “Wipe main and paste files” scripts |

If an old guide tells you to `git checkout main` and delete everything except `CNAME`, **ignore it**.

---

## Build / deploy

### Site didn’t update after push

1. GitHub → **Actions** → open the latest **Deploy to GitHub Pages** run.
2. Confirm it succeeded (green).
3. Hard-refresh the browser (`Ctrl+Shift+R`) or try an incognito window (CDN/cache).
4. Confirm Pages is set to **GitHub Actions** (Settings → Pages).

### Build fails on Actions

| Symptom | Fix |
|---------|-----|
| `npm ci` fails | Commit an up-to-date `package-lock.json`; Node 20 required |
| Vite build error | Run `npm run build` locally and fix the same error |
| Missing module | Dependency not in `package.json` / lockfile |

### Supabase / admin work locally but not on live site

The workflow only injects secrets that exist in the repo:

**Settings → Secrets and variables → Actions**

Required for full backend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_SECRET`

Re-run the workflow after adding secrets (env is baked in at **build** time).

### Images 404 on live site

1. Confirm files exist under `public/images/products/` (not only under a local `dist/`).
2. Paths in `products.js` should look like `images/products/product-3.webp` (no leading `/` issues relative to site root).
3. Rebuild and redeploy; hashed JS/CSS changes every build — old bookmarked asset URLs break (expected).

### CSS/JS 404 after deploy

Usually a stale tab holding an old `index.html` that points at previous hashed filenames. Hard refresh or wait for cache TTL.

---

## Local development

### `npm run dev` won’t start

```bash
node -v          # need 20+
rm -rf node_modules
npm install
npm run dev
```

### Env vars not applied

- Vite only reads `.env` at **start** — restart the dev server after edits.
- Names must start with `VITE_` to reach the browser.

### Cart / admin session weirdness

Clear site data for localhost (or remove `localStorage` keys: `cart`, `admin_session`, `customerPhone`, etc.).

### Lint / tests fail

```bash
npm run lint
npm test
```

Fix reported files; config lives in `.eslintrc.cjs`, `.prettierrc`, `vite.config.js` (Vitest).

---

## Image tooling

| Command | When it fails |
|---------|----------------|
| `images:sync` | Needs `GEMINI_API_KEY` in `.env` and files in `pending_images/` |
| `images:fix` | Only fills empty paths when `product-{id}.webp` already exists |
| `images:report` | Needs `src/data/products.js` + `public/images/products/` |

There is **no** `preview_images.js` script anymore.

---

## WhatsApp checkout

- Number is configured in cart / floating WhatsApp components.
- If the chat opens empty, check that cart items serialize into the message template (names, qty, total).

---

## Getting help checklist

1. Reproduce locally with `npm run dev` / `npm run build`.
2. Note exact error text from terminal or Actions log.
3. Confirm which branch and whether secrets exist.
4. Never paste real anon keys or admin secrets into public issues.
