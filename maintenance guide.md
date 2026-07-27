# Maintenance Guide

Short runbook for keeping the live shop healthy.

## Deploy (only path)

1. Merge approved changes to `main`.
2. GitHub Actions builds and deploys Pages automatically.
3. Confirm green check under **Actions**.

No two-branch copy, no wiping `main` with `dist` contents.

## After each content change

| Change | Action |
|--------|--------|
| Price / name / new product | Edit `src/data/products.js`, keep all existing products |
| Photo | Put file in `public/images/products/`, path in `products.js` |
| Contact WhatsApp | Update cart / floating WhatsApp / footer components |
| Env / Supabase | Update GitHub Secrets + local `.env`, redeploy |

## Weekly checks

- [ ] Home page loads on mobile and desktop
- [ ] Add to cart + WhatsApp message looks correct
- [ ] Product images load (spot-check categories)
- [ ] Admin still opens with current secret (rotate if leaked)
- [ ] Actions last deploy is green

## Image maintenance

```bash
npm run images:report
# optional:
npm run images:fix
npm run images:sync   # needs pending_images/ + GEMINI_API_KEY
```

See **IMAGE_SYNC_GUIDE.md**.

## Incidents

| Issue | First response |
|-------|----------------|
| Site down / old version | Check Actions + Pages settings |
| Wrong prices live | Hotfix `products.js` on a PR, merge, wait for deploy |
| Secrets leaked | Rotate Supabase anon key + admin secret; update Secrets; force new build |
| Need rollback | Checkout known-good commit/branch (e.g. `restore-before-redesign-20260727`), open PR, get approval before force-deploy |

## Do not

- Commit `.env`
- Put `service_role` in any `VITE_*` variable
- Maintain parallel Desktop trees as the “real” app
- Push redesign work to `main` without explicit approval
