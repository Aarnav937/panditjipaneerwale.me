# AI Image Sync Guide

Automatically identify, crop, and organize product images using Gemini AI.

## Quick Start

1. **Drop images** into `./pending_images/` folder
2. **Run**: `npm run images:sync`
3. **Done!** Images are processed and linked to products

## How It Works

```
You drop image → AI identifies product → Smart crop → Save to website → Update code
```

### The AI Does:
- **Identifies** the exact product (including weight/size variants)
- **Crops** the image to focus on the product (removes background)
- **Converts** to optimized WebP format (800x800)
- **Updates** `src/data/products.js` automatically

### Safety Mode
If AI is **not sure** (< 80% confidence), it moves the image to:
```
pending_images/needs_review/
```
You can manually handle these images.

## Requirements

- `GEMINI_API_KEY` in your `.env` file

## Supported Formats

JPG, PNG, WebP, GIF, BMP, TIFF

## Commands

| Command | Description |
|---------|-------------|
| `npm run images:sync` | Process all pending images |

## Folder Structure

```
pending_images/           ← Drop images here
pending_images/needs_review/  ← AI puts uncertain images here
public/images/products/   ← Final processed images go here
```

## Tips

1. **Clear photos work best** - Good lighting, minimal background
2. **One product per image** - AI gets confused with multiple products
3. **Show weight/size labels** - Helps AI distinguish variants (500g vs 1kg)
