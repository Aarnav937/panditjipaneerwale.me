/**
 * AI Image Sync Tool
 * ===================
 * Automatically identifies, crops, and organizes product images using Gemini AI.
 * 
 * Usage: node sync_by_name.js
 * 
 * Place images in ./pending_images/ folder and run this script.
 * - Matched images → public/images/products/
 * - Uncertain images → pending_images/needs_review/
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ===== Configuration =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    pendingDir: path.join(__dirname, 'pending_images'),
    reviewDir: path.join(__dirname, 'pending_images', 'needs_review'),
    outputDir: path.join(__dirname, 'public', 'images', 'products'),
    productsFile: path.join(__dirname, 'src', 'data', 'products.js'),
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'],
    outputSize: 800, // Square output size
    confidenceThreshold: 0.8,
    apiDelay: parseInt(process.env.GEMINI_DELAY_MS) || 2000,
};

// ===== Gemini Setup =====
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env file');
    console.log('Please add your API key to .env file:');
    console.log('GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
});

// ===== Utility Functions =====

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Delete file with retry logic (handles Windows EBUSY errors)
 */
async function safeDelete(filePath, maxRetries = 5, delayMs = 500) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            if (error.code === 'EBUSY' && attempt < maxRetries) {
                await sleep(delayMs * attempt); // Exponential backoff
                continue;
            }
            if (error.code === 'ENOENT') {
                return true; // Already deleted
            }
            throw error;
        }
    }
    return false;
}

/**
 * Move file with retry logic (handles Windows EBUSY errors)
 */
async function safeMove(sourcePath, destPath, maxRetries = 5, delayMs = 500) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await fs.rename(sourcePath, destPath);
            return true;
        } catch (error) {
            if (error.code === 'EBUSY' && attempt < maxRetries) {
                await sleep(delayMs * attempt); // Exponential backoff
                continue;
            }
            throw error;
        }
    }
    return false;
}

/**
 * Load products from products.js file
 */
async function loadProducts() {
    try {
        const content = await fs.readFile(CONFIG.productsFile, 'utf-8');

        // Extract products array using regex
        const match = content.match(/export\s+const\s+products\s*=\s*\[([\s\S]*?)\];/);
        if (!match) {
            throw new Error('Could not find products array in file');
        }

        // Parse the products - we need to extract id, name, category from the file
        const products = [];
        const productRegex = /\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*price:\s*([\d.]+),\s*image:\s*"([^"]*)",\s*description:\s*"([^"]*)"\s*\}/g;

        let productMatch;
        while ((productMatch = productRegex.exec(content)) !== null) {
            products.push({
                id: parseInt(productMatch[1]),
                name: productMatch[2],
                category: productMatch[3],
                price: parseFloat(productMatch[4]),
                image: productMatch[5],
                description: productMatch[6]
            });
        }

        console.log(`📦 Loaded ${products.length} products from database`);
        return { products, rawContent: content };
    } catch (error) {
        console.error('❌ Error loading products:', error.message);
        throw error;
    }
}

/**
 * Get list of images in pending folder
 */
async function getPendingImages() {
    try {
        const files = await fs.readdir(CONFIG.pendingDir);
        const images = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return CONFIG.supportedFormats.includes(ext) && !file.startsWith('.');
        });
        return images;
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(CONFIG.pendingDir, { recursive: true });
            return [];
        }
        throw error;
    }
}

/**
 * Convert image to base64 for Gemini API
 */
async function imageToBase64(imagePath) {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.tiff': 'image/tiff',
    };
    return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Use Gemini to identify product and get crop coordinates
 */
async function identifyProduct(imagePath, products) {
    const base64Image = await imageToBase64(imagePath);
    const mimeType = getMimeType(imagePath);

    // Create product list for prompt
    const productList = products.map(p => `ID:${p.id} - ${p.name} (${p.category})`).join('\n');

    const prompt = `You are a product identification AI for an Indian grocery store. 

Analyze this product image and match it to one of these products:

${productList}

IMPORTANT RULES:
1. Look for brand names, product names, and weight/quantity on the packaging
2. Pay attention to weight/size variants (500g vs 1kg, 100ml vs 1L, etc.)
3. Match the EXACT product including size/weight
4. If you see multiple products or cannot identify clearly, respond with UNSURE

Respond in this EXACT JSON format:
{
  "product_id": <number or null if unsure>,
  "confidence": <0.0 to 1.0>,
  "matched_name": "<the product name you matched or null>",
  "reasoning": "<brief explanation of why you matched this product>",
  "crop_box": {
    "x": <left position 0-100%>,
    "y": <top position 0-100%>,
    "width": <width 0-100%>,
    "height": <height 0-100%>
  }
}

The crop_box should focus on the main product, removing any background/table/clutter.
If unsure, set product_id to null and confidence to 0.`;

    try {
        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType,
                    data: base64Image
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log('⚠️ Could not parse AI response');
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
    } catch (error) {
        console.error('❌ Gemini API error:', error.message);
        return null;
    }
}

/**
 * Process and crop image using sharp
 * Note: We read the buffer first to avoid file locking issues on Windows
 */
async function processImage(inputPath, cropBox) {
    // Read file into buffer first to release file handle quickly
    const inputBuffer = await fs.readFile(inputPath);

    try {
        const image = sharp(inputBuffer);
        const metadata = await image.metadata();

        // Convert percentage crop to pixels
        const cropX = Math.round((cropBox.x / 100) * metadata.width);
        const cropY = Math.round((cropBox.y / 100) * metadata.height);
        const cropWidth = Math.round((cropBox.width / 100) * metadata.width);
        const cropHeight = Math.round((cropBox.height / 100) * metadata.height);

        // Ensure crop dimensions are valid
        const safeCropWidth = Math.min(Math.max(cropWidth, 1), metadata.width - cropX);
        const safeCropHeight = Math.min(Math.max(cropHeight, 1), metadata.height - cropY);

        if (safeCropWidth < 10 || safeCropHeight < 10) {
            // Invalid crop, use full image
            return sharp(inputBuffer)
                .resize(CONFIG.outputSize, CONFIG.outputSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .webp({ quality: 90 })
                .toBuffer();
        }

        return sharp(inputBuffer)
            .extract({ left: cropX, top: cropY, width: safeCropWidth, height: safeCropHeight })
            .resize(CONFIG.outputSize, CONFIG.outputSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .webp({ quality: 90 })
            .toBuffer();
    } catch (error) {
        console.error('❌ Image processing error:', error.message);
        // Fallback: just resize without cropping
        return sharp(inputBuffer)
            .resize(CONFIG.outputSize, CONFIG.outputSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .webp({ quality: 90 })
            .toBuffer();
    }
}

/**
 * Update products.js file with new image path
 */
async function updateProductsFile(productId, imagePath, rawContent) {
    const relativePath = `images/products/product-${productId}.webp`;

    // Find and replace the image field for this product
    const regex = new RegExp(
        `(id:\\s*${productId},\\s*name:\\s*"[^"]+",\\s*category:\\s*"[^"]+",\\s*price:\\s*[\\d.]+,\\s*image:\\s*)"([^"]*)"`,
        'g'
    );

    const updatedContent = rawContent.replace(regex, `$1"${relativePath}"`);

    await fs.writeFile(CONFIG.productsFile, updatedContent, 'utf-8');
    return relativePath;
}

/**
 * Move file to needs_review folder
 */
async function moveToReview(imagePath, filename, reason) {
    await fs.mkdir(CONFIG.reviewDir, { recursive: true });
    const destPath = path.join(CONFIG.reviewDir, filename);
    try {
        await safeMove(imagePath, destPath);
        console.log(`📁 Moved to review: ${filename}`);
        console.log(`   Reason: ${reason}`);
    } catch (error) {
        console.log(`⚠️ Could not move ${filename} to review (may already be processed)`);
        console.log(`   Reason for review: ${reason}`);
    }
}

// ===== Main Execution =====

async function main() {
    console.log('');
    console.log('🚀 AI Image Sync Tool');
    console.log('====================');
    console.log('');

    // Ensure directories exist
    await fs.mkdir(CONFIG.pendingDir, { recursive: true });
    await fs.mkdir(CONFIG.reviewDir, { recursive: true });
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    // Load products
    let productsData;
    try {
        productsData = await loadProducts();
    } catch (error) {
        process.exit(1);
    }

    // Get pending images
    const pendingImages = await getPendingImages();

    if (pendingImages.length === 0) {
        console.log('📭 No images found in pending_images/ folder');
        console.log('');
        console.log('To use this tool:');
        console.log('1. Drop your product images into ./pending_images/');
        console.log('2. Run: npm run images:sync');
        console.log('');
        return;
    }

    console.log(`📷 Found ${pendingImages.length} image(s) to process`);
    console.log('');

    let processed = 0;
    let matched = 0;
    let reviewNeeded = 0;

    for (const filename of pendingImages) {
        const imagePath = path.join(CONFIG.pendingDir, filename);
        console.log(`🔍 Processing: ${filename}`);

        try {
            // Identify product using AI
            const identification = await identifyProduct(imagePath, productsData.products);

            if (!identification || identification.product_id === null || identification.confidence < CONFIG.confidenceThreshold) {
                // Not confident enough - move to review
                const reason = identification
                    ? `Low confidence (${(identification.confidence * 100).toFixed(0)}%): ${identification.reasoning}`
                    : 'Could not identify product';
                await moveToReview(imagePath, filename, reason);
                reviewNeeded++;
            } else {
                // High confidence match
                const product = productsData.products.find(p => p.id === identification.product_id);

                if (!product) {
                    await moveToReview(imagePath, filename, `Product ID ${identification.product_id} not found in database`);
                    reviewNeeded++;
                    continue;
                }

                console.log(`✅ Matched: ${product.name} (${(identification.confidence * 100).toFixed(0)}% confident)`);
                console.log(`   Reason: ${identification.reasoning}`);

                // Process and save image
                const cropBox = identification.crop_box || { x: 0, y: 0, width: 100, height: 100 };
                const processedBuffer = await processImage(imagePath, cropBox);

                const outputFilename = `product-${product.id}.webp`;
                const outputPath = path.join(CONFIG.outputDir, outputFilename);

                await fs.writeFile(outputPath, processedBuffer);
                console.log(`📸 Saved: ${outputFilename}`);

                // Update products.js
                const relativePath = await updateProductsFile(product.id, outputPath, productsData.rawContent);
                console.log(`📝 Updated products.js: ${relativePath}`);

                // Reload products file content for next iteration
                productsData = await loadProducts();

                // Delete original file with retry logic
                await safeDelete(imagePath);

                matched++;
            }

            processed++;

            // Rate limiting
            if (pendingImages.indexOf(filename) < pendingImages.length - 1) {
                await sleep(CONFIG.apiDelay);
            }

        } catch (error) {
            console.error(`❌ Error processing ${filename}:`, error.message);
            await moveToReview(imagePath, filename, `Error: ${error.message}`);
            reviewNeeded++;
        }

        console.log('');
    }

    // Summary
    console.log('====================');
    console.log('📊 Summary');
    console.log('====================');
    console.log(`Total processed: ${processed}`);
    console.log(`Successfully matched: ${matched}`);
    console.log(`Needs review: ${reviewNeeded}`);

    if (reviewNeeded > 0) {
        console.log('');
        console.log(`⚠️ ${reviewNeeded} image(s) need manual review in:`);
        console.log(`   ${CONFIG.reviewDir}`);
    }

    console.log('');
}

// Run
main().catch(console.error);
