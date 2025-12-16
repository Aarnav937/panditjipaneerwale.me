# 🖼️ Smart Image Sync - User Guide

This tool uses **Google Gemini AI** to automatically detect products in your images and match them to your product database. No more manual renaming or copy-pasting image paths!

---

## 🚀 Quick Start

### 1. Get a Free Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 2. Set Up Your API Key
Open the `.env` file in your project root and add your key:
```
GEMINI_API_KEY=paste_your_key_here
```

### 3. Install Dependencies
Run this once:
```powershell
npm install
```

### 4. Upload Images
Drop your product images into:
```
images/incoming/
```

### 5. Preview & Sync
```powershell
npm run images
```

This will:
- Show you what products need images
- Analyze your uploaded images with AI
- Show you what matches it found
- Ask if you want to apply the changes

---

## 📋 Available Commands

| Command | What it does |
|---------|--------------|
| `npm run images` | **Preview mode** - Shows analysis, asks before applying |
| `npm run images:sync` | **Direct sync** - Applies changes without preview |
| `npm run dev` | Start local server to preview website |

---

## 📁 Folder Structure

```
images/
├── incoming/     ← Drop your images here
├── processed/    ← Successfully matched images (backup)
└── unmatched/    ← Images that couldn't be matched

public/images/products/    ← Where matched images go
```

---

## ⚙️ Configuration Options

In your `.env` file, you can set:

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | (required) | Your Gemini API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model to use (`gemini-2.5-flash` or `gemini-2.5-pro`) |
| `GEMINI_DELAY_MS` | `2000` | Delay between API calls in ms (rate limiting) |

---

## 🔄 How It Works

1. **You drop images** into `uploads/incoming/`
2. **Gemini AI analyzes** each image to detect:
   - Brand name
   - Product type
   - Package size/weight
3. **Matches to products** in your database
4. **Moves the image** to `public/images/products/` with correct name
5. **Updates `products.js`** with the new image path
6. **Unmatched images** go to `uploads/unmatched/` for review

---

## 💡 Tips for Best Results

### Image Quality
- Use clear, well-lit photos
- Show the product label/packaging clearly
- Avoid blurry or dark images
- White/neutral backgrounds work best

### File Names
The original filename doesn't matter - AI detects the product from the image itself!

### Supported Formats
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`

---

## 🔧 Troubleshooting

### "No API key found"
1. Make sure you have a `.env` file in the project root
2. Check that it contains: `GEMINI_API_KEY=your_actual_key`
3. No quotes around the key

### "Failed to load products"
The `src/data/products.js` file might have syntax errors. Check it for issues.

### "Low confidence match"
If AI isn't confident about a match (below 70%), the image goes to `uploads/unmatched/`. You can:
- Take a clearer photo
- Manually move and rename the image

### Images not showing on website
After syncing, run `npm run dev` and check if:
1. The image is in `public/images/products/`
2. The path in `products.js` is correct

---

## 📊 Checking Status

Run `npm run images` with no images in the incoming folder to see:
- How many products have real images
- How many still use placeholders
- List of products that need images (grouped by category)

---

## 🆘 Need Help?

If something isn't working, check:
1. API key is set correctly
2. Dependencies are installed (`npm install`)
3. Images are in the right folder (`uploads/incoming/`)
4. Node.js is version 18 or higher

