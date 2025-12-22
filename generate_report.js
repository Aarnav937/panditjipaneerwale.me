/**
 * Product-Image Report Generator
 * Generates a comprehensive list of all products with their image status
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, 'src', 'data', 'products.js');
const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'products');

async function loadProducts() {
    const content = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = [];
    const regex = /\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*price:\s*([\d.]+),\s*image:\s*"([^"]*)",\s*description:\s*"([^"]*)"\s*\}/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
        products.push({
            id: parseInt(match[1]),
            name: match[2],
            category: match[3],
            price: parseFloat(match[4]),
            image: match[5],
            description: match[6]
        });
    }
    return products;
}

async function getExistingImages() {
    const files = await fs.readdir(IMAGES_DIR);
    return files.filter(f => f.endsWith('.webp')).map(f => {
        const match = f.match(/product-(\d+)\.webp/);
        return match ? parseInt(match[1]) : null;
    }).filter(Boolean);
}

async function main() {
    const products = await loadProducts();
    const existingImageIds = await getExistingImages();

    // Sort products by ID
    products.sort((a, b) => a.id - b.id);

    // Group by category
    const byCategory = {};
    products.forEach(p => {
        if (!byCategory[p.category]) byCategory[p.category] = [];
        byCategory[p.category].push(p);
    });

    let report = `# Product-Image Report\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `## Summary\n`;
    report += `- **Total Products:** ${products.length}\n`;
    report += `- **Total Image Files:** ${existingImageIds.length}\n`;
    report += `- **Products WITH image path:** ${products.filter(p => p.image).length}\n`;
    report += `- **Products WITHOUT image path:** ${products.filter(p => !p.image).length}\n\n`;

    // Products without images
    const noImage = products.filter(p => !p.image);
    report += `## ⚠️ Products WITHOUT Image Path (${noImage.length})\n\n`;
    report += `| ID | Product Name | Category |\n`;
    report += `|----|--------------|----------|\n`;
    noImage.forEach(p => {
        const hasFile = existingImageIds.includes(p.id) ? '📁' : '';
        report += `| ${p.id} ${hasFile} | ${p.name} | ${p.category} |\n`;
    });

    report += `\n---\n\n`;

    // All products by category
    report += `## All Products by Category\n\n`;

    for (const [category, prods] of Object.entries(byCategory)) {
        report += `### ${category} (${prods.length} products)\n\n`;
        report += `| ID | Product Name | Has Image? | Image File Exists? |\n`;
        report += `|----|--------------|------------|--------------------|\n`;

        prods.forEach(p => {
            const hasPath = p.image ? '✅' : '❌';
            const fileExists = existingImageIds.includes(p.id) ? '✅' : '❌';
            report += `| ${p.id} | ${p.name} | ${hasPath} | ${fileExists} |\n`;
        });
        report += `\n`;
    }

    // Save report
    const reportPath = path.join(__dirname, 'PRODUCT_IMAGE_REPORT.md');
    await fs.writeFile(reportPath, report, 'utf-8');

    console.log(`\n📊 Report generated: PRODUCT_IMAGE_REPORT.md\n`);
    console.log(`Summary:`);
    console.log(`  Total Products: ${products.length}`);
    console.log(`  Total Image Files: ${existingImageIds.length}`);
    console.log(`  Products WITH image path: ${products.filter(p => p.image).length}`);
    console.log(`  Products WITHOUT image path: ${products.filter(p => !p.image).length}`);

    // Check for orphan images (images without products)
    const productIds = new Set(products.map(p => p.id));
    const orphanImages = existingImageIds.filter(id => !productIds.has(id));
    if (orphanImages.length > 0) {
        console.log(`\n⚠️ Orphan image files (no matching product): ${orphanImages.join(', ')}`);
    }
}

main().catch(console.error);
