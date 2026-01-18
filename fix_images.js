/**
 * Fix Missing Image Paths
 * Automatically assigns image paths to products that already have image files
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, 'src', 'data', 'products.js');
const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'products');

async function getExistingImages() {
    const files = await fs.readdir(IMAGES_DIR);
    return files.filter(f => f.endsWith('.webp')).map(f => {
        const match = f.match(/product-(\d+)\.webp/);
        return match ? parseInt(match[1]) : null;
    }).filter(Boolean);
}

async function main() {
    console.log('\n🔧 Fixing Missing Image Paths\n');

    let content = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const existingImageIds = new Set(await getExistingImages());

    let fixed = 0;

    // Find all products with empty images and fill them if file exists
    const regex = /(\{\s*id:\s*)(\d+)(,\s*name:\s*"[^"]+",\s*category:\s*"[^"]+",\s*price:\s*[\d.]+,\s*image:\s*)""/g;

    content = content.replace(regex, (match, before, id, after) => {
        const productId = parseInt(id);
        if (existingImageIds.has(productId)) {
            fixed++;
            console.log(`✅ Fixed product ${productId}: images/products/product-${productId}.webp`);
            return `${before}${id}${after}"images/products/product-${productId}.webp"`;
        }
        return match;
    });

    await fs.writeFile(PRODUCTS_FILE, content, 'utf-8');

    console.log(`\n📊 Summary: Fixed ${fixed} products with missing image paths\n`);
}

main().catch(console.error);
