# 🛠️ Troubleshooting Guide: Image & Deployment Issues

> **A complete guide for fixing common deployment problems on this project.**  
> This document was created after resolving an issue where images worked on localhost but not on the live website.

---

## 📋 Table of Contents

1. [Project Architecture](#project-architecture)
2. [Problem: Images Show on Localhost but Not Live Site](#problem-images-show-on-localhost-but-not-live-site)
3. [Problem: 404 Error for JS/CSS Files](#problem-404-error-for-jscss-files)
4. [How to Deploy Changes](#how-to-deploy-changes)
5. [How to Verify Deployment](#how-to-verify-deployment)
6. [Quick Reference Commands](#quick-reference-commands)

---

## Project Architecture

This project uses a **two-branch deployment system**:

| Branch | Purpose | What's Here |
|--------|---------|-------------|
| `source` | Development | Source code, `src/`, `public/`, `package.json` |
| `main` | Production (GitHub Pages) | Built files only: `index.html`, `assets/`, `images/` |

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   source branch          npm run build         main branch       │
│   ┌──────────────┐      ─────────────►        ┌──────────────┐  │
│   │ src/         │                             │ index.html   │  │
│   │ public/      │        dist/                │ assets/      │  │
│   │ package.json │      ──────────►            │ images/      │  │
│   └──────────────┘                             │ CNAME        │  │
│                                                └──────────────┘  │
│                                                       │          │
│                                                       ▼          │
│                                            GitHub Pages Live     │
│                                            panditjipaneerwale.me │
└─────────────────────────────────────────────────────────────────┘
```

> ⚠️ **CRITICAL**: Never directly edit the `main` branch. Always work on `source` and deploy.

---

## Problem: Images Show on Localhost but Not Live Site

### Symptoms
- Products show real images on `localhost:5173`
- Products show gray placeholders or broken images on `panditjipaneerwale.me`
- Browser console shows: `GET https://panditjipaneerwale.me/images/products/product-X.webp 404`

### Root Cause
The `main` branch is missing the product images. When you add images to `public/images/products/` on the `source` branch, they must be deployed to `main`.

### How to Check
```powershell
# See what images exist on main branch
git ls-tree -r --name-only origin/main -- images/
```

### Solution
Follow the [How to Deploy Changes](#how-to-deploy-changes) section to redeploy with images.

---

## Problem: 404 Error for JS/CSS Files

### Symptoms
- Website shows a **blank white page**
- Browser console shows: `GET https://panditjipaneerwale.me/assets/index-XXXXX.js net::ERR_ABORTED 404`

### Root Cause
The `index.html` on `main` references old asset filenames (with different hashes), but the actual JS/CSS files have new hashes.

**Example:**
- `index.html` requests: `assets/index-ABC123.js`
- Actual file on server: `assets/index-XYZ789.js`

This happens when `index.html` wasn't updated during the last deployment.

### Solution
Rebuild and redeploy:

```powershell
# 1. On source branch, rebuild
npm run build

# 2. Verify the new asset names
dir dist\assets

# 3. Verify index.html references matching names
type dist\index.html

# 4. Deploy to main (see full steps below)
```

---

## How to Deploy Changes

### Step 1: Commit Source Changes

```powershell
# Ensure you're on source branch
git checkout source

# Stage and commit your changes
git add .
git commit -m "Your descriptive commit message"
git push origin source
```

### Step 2: Build the Project

```powershell
# Install dependencies (if needed)
npm install

# Build for production
npm run build
```

This creates the `dist/` folder containing:
- `index.html` - Entry point with correct asset references
- `assets/` - JS and CSS with hashed filenames
- `images/` - All images from `public/images/`

### Step 3: Deploy to Main Branch

```powershell
# Switch to main
git checkout main

# Clean old files (keep .git, dist, and CNAME)
Get-ChildItem -Path . -Exclude ".git", "dist", "CNAME" | Remove-Item -Recurse -Force

# Move build files to root
Move-Item -Path .\dist\* -Destination . -Force

# Remove empty dist folder
Remove-Item -Path .\dist -Force -ErrorAction SilentlyContinue

# Ensure CNAME exists for custom domain
Set-Content -Path .\CNAME -Value "panditjipaneerwale.me"

# Commit and push
git add .
git commit -m "Deploy: Your deployment description"
git push origin main
```

### Step 4: Return to Source Branch

```powershell
# IMPORTANT: Always return to source after deploying
git checkout source
```

---

## How to Verify Deployment

### Method 1: Check in Browser (Quick)

1. Open **Chrome** in **Incognito mode** (Ctrl+Shift+N)
2. Go to `https://panditjipaneerwale.me`
3. **Hard refresh**: Press `Ctrl+Shift+R`
4. Check if the page loads and images appear

### Method 2: Check with DevTools (Detailed)

1. Open Chrome → Go to `https://panditjipaneerwale.me`
2. Press **F12** to open DevTools

#### Check Console Tab
- Look for **red error messages**
- ✅ No red errors = Good
- ❌ `404` errors = Deployment issue

#### Check Network Tab
1. Click **Network** tab
2. Press **Ctrl+R** to refresh
3. Type `images` in the filter box
4. Check the **Status** column:
   - ✅ `200` = File loaded successfully
   - ❌ `404` = File not found

### Method 3: Direct URL Test

Open these URLs directly in your browser:

```
https://panditjipaneerwale.me/images/products/product-6.webp
https://panditjipaneerwale.me/assets/index-BHn4GYAH.js
```

- ✅ If they load = Deployment worked
- ❌ If 404 = Files missing from main branch

### Method 4: Command Line Check

```powershell
# Test if an image is accessible
Invoke-WebRequest -Uri "https://panditjipaneerwale.me/images/products/product-6.webp" -Method Head
```

---

## Quick Reference Commands

### Check Current Branch
```powershell
git branch
```

### Check What's on Main Branch
```powershell
git ls-tree --name-only origin/main
git ls-tree -r --name-only origin/main -- images/
git ls-tree -r --name-only origin/main -- assets/
```

### View Main Branch's index.html
```powershell
git show origin/main:index.html
```

### Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"

### Full Rebuild from Scratch
```powershell
# On source branch
git checkout source
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

---

## Checklist: Before Deploying

- [ ] All changes committed to `source` branch?
- [ ] `npm run build` completed without errors?
- [ ] `dist/index.html` exists?
- [ ] `dist/images/products/` has your images?
- [ ] You're ready to switch to `main`?

## Checklist: After Deploying

- [ ] Pushed to `main` branch?
- [ ] Switched back to `source` branch?
- [ ] Verified site loads in Incognito mode?
- [ ] Checked F12 Console for 404 errors?
- [ ] Images display correctly?

---

## Common Mistakes to Avoid

| Mistake | Consequence | Prevention |
|---------|-------------|------------|
| Editing `main` directly | Overwrites on next deploy | Always work on `source` |
| Forgetting `npm run build` | Old code deployed | Always build before deploy |
| Not switching back to `source` | Future work breaks | Run `git checkout source` after |
| Browser cache | Shows old version | Use Incognito or Ctrl+Shift+R |
| Missing CNAME | Domain doesn't work | Always set CNAME file |

---

*Last Updated: December 2024*
