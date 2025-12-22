/**
 * AI Image Sync Tool (Hybrid: Filename + AI Vision)
 * ===================================================
 * Uses filename matching FIRST, then falls back to Gemini AI vision for verification.
 * 
 * USAGE:
 * 1. Name your image files to match the product name
 *    Example: "Bikaji Bhujia.jpg" or "Fresh Paneer (500g).png"
 * 2. Drop images into ./pending_images/
 * 3. Run: npm run images:sync
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
    outputSize: 800,
    matchThreshold: 0.75,
    aiConfidenceThreshold: 0.7,
    apiDelay: parseInt(process.env.GEMINI_DELAY_MS) || 1500,
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
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
});

console.log(`🤖 Using Gemini model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}`);

// ===== Utility Functions =====

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeDelete(filePath, maxRetries = 5, delayMs = 500) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            if (error.code === 'EBUSY' && attempt < maxRetries) {
                await sleep(delayMs * attempt);
                continue;
            }
            if (error.code === 'ENOENT') {
                return true;
            }
            throw error;
        }
    }
    return false;
}

async function safeMove(sourcePath, destPath, maxRetries = 5, delayMs = 500) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await fs.rename(sourcePath, destPath);
            return true;
        } catch (error) {
            if (error.code === 'EBUSY' && attempt < maxRetries) {
                await sleep(delayMs * attempt);
                continue;
            }
            throw error;
        }
    }
    return false;
}

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[_\-\.]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/(\d+)\s*(g|gm|gram|gms|kg|ml|l|ltr|pcs|pc)/gi, '$1$2')
        .replace(/gm\b/gi, 'g')
        .replace(/gram\b/gi, 'g')
        .replace(/gms\b/gi, 'g')
        .replace(/ltr\b/gi, 'l')
        .replace(/pcs\b/gi, 'pc')
        .trim();
}

function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
}

function calculateSimilarity(str1, str2) {
    const norm1 = normalize(str1);
    const norm2 = normalize(str2);

    if (norm1 === norm2) return 1.0;

    if (norm1.includes(norm2) || norm2.includes(norm1)) {
        const longer = Math.max(norm1.length, norm2.length);
        const shorter = Math.min(norm1.length, norm2.length);
        return 0.8 + (0.2 * (shorter / longer));
    }

    const distance = levenshteinDistance(norm1, norm2);
    const maxLen = Math.max(norm1.length, norm2.length);
    return maxLen > 0 ? 1 - (distance / maxLen) : 1;
}

function extractProductName(filename) {
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    return nameWithoutExt
        .replace(/[_\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function findBestMatch(filename, products) {
    const searchName = extractProductName(filename);

    let bestMatch = null;
    let bestScore = 0;

    for (const product of products) {
        const score = calculateSimilarity(searchName, product.name);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = product;
        }
    }

    if (bestScore >= CONFIG.matchThreshold) {
        return { product: bestMatch, score: bestScore };
    }

    return null;
}

// ===== AI Functions =====

async function imageToBase64(imagePath) {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
}

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

async function identifyProductWithAI(imagePath, products) {
    const base64Image = await imageToBase64(imagePath);
    const mimeType = getMimeType(imagePath);

    const productList = products.map(p => `ID:${p.id} - ${p.name} (${p.category})`).join('\n');

    const prompt = `You are a product identification AI for an Indian grocery store.

Analyze this product image and match it to ONE of these products:

${productList}

IMPORTANT RULES:
1. Look for brand names, product names, and weight/quantity on the packaging
2. Pay attention to weight/size variants (500g vs 1kg, 100ml vs 1L, etc.)
3. Match the EXACT product including size/weight
4. If you see multiple products or cannot identify clearly, set product_id to null

Respond ONLY with this JSON (no other text):
{
  "product_id": <number or null>,
  "confidence": <0.0 to 1.0>,
  "matched_name": "<product name or null>",
  "reasoning": "<brief explanation>"
}`;

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

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log('⚠️ Could not parse AI response');
            return null;
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('❌ Gemini API error:', error.message);
        return null;
    }
}

// ===== File Functions =====

async function loadProducts() {
    try {
        const content = await fs.readFile(CONFIG.productsFile, 'utf-8');
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

async function processImage(inputPath) {
    const inputBuffer = await fs.readFile(inputPath);

    try {
        return sharp(inputBuffer)
            .resize(CONFIG.outputSize, CONFIG.outputSize, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .webp({ quality: 90 })
            .toBuffer();
    } catch (error) {
        console.error('❌ Image processing error:', error.message);
        throw error;
    }
}

async function updateProductsFile(productId, rawContent) {
    const relativePath = `images/products/product-${productId}.webp`;

    const regex = new RegExp(
        `(id:\\s*${productId},\\s*name:\\s*"[^"]+",\\s*category:\\s*"[^"]+",\\s*price:\\s*[\\d.]+,\\s*image:\\s*)"([^"]*)"`,
        'g'
    );

    const updatedContent = rawContent.replace(regex, `$1"${relativePath}"`);
    await fs.writeFile(CONFIG.productsFile, updatedContent, 'utf-8');
    return relativePath;
}

async function moveToReview(imagePath, filename, reason) {
    await fs.mkdir(CONFIG.reviewDir, { recursive: true });
    const destPath = path.join(CONFIG.reviewDir, filename);
    try {
        await safeMove(imagePath, destPath);
        console.log(`📁 Moved to review: ${filename}`);
        console.log(`   Reason: ${reason}`);
    } catch (error) {
        console.log(`⚠️ Could not move ${filename} to review`);
    }
}

// ===== Main Execution =====

async function main() {
    console.log('');
    console.log('🚀 AI Image Sync Tool (Hybrid: Filename + AI Vision)');
    console.log('====================================================');
    console.log('');

    await fs.mkdir(CONFIG.pendingDir, { recursive: true });
    await fs.mkdir(CONFIG.reviewDir, { recursive: true });
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    let productsData;
    try {
        productsData = await loadProducts();
    } catch (error) {
        process.exit(1);
    }

    const pendingImages = await getPendingImages();

    if (pendingImages.length === 0) {
        console.log('📭 No images found in pending_images/ folder');
        console.log('');
        console.log('To use this tool:');
        console.log('1. Name your image file to match the product name');
        console.log('2. Drop images into ./pending_images/');
        console.log('3. Run: npm run images:sync');
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
        console.log(`\n🔍 Processing: ${filename}`);

        try {
            // Step 1: Try filename matching first
            const filenameMatch = findBestMatch(filename, productsData.products);

            let finalProduct = null;
            let matchMethod = '';

            if (filenameMatch && filenameMatch.score >= 0.95) {
                // High confidence filename match - use directly
                finalProduct = filenameMatch.product;
                matchMethod = `Filename (${(filenameMatch.score * 100).toFixed(0)}%)`;
                console.log(`   📝 Filename match: ${finalProduct.name} (${(filenameMatch.score * 100).toFixed(0)}%)`);
            } else {
                // Use AI to identify product
                console.log(`   🤖 Using AI to identify...`);
                const aiResult = await identifyProductWithAI(imagePath, productsData.products);

                if (aiResult && aiResult.product_id && aiResult.confidence >= CONFIG.aiConfidenceThreshold) {
                    finalProduct = productsData.products.find(p => p.id === aiResult.product_id);
                    matchMethod = `AI (${(aiResult.confidence * 100).toFixed(0)}%)`;
                    console.log(`   🤖 AI identified: ${aiResult.matched_name} (${(aiResult.confidence * 100).toFixed(0)}%)`);
                    console.log(`   💡 Reason: ${aiResult.reasoning}`);
                } else if (filenameMatch) {
                    // Fall back to lower-confidence filename match
                    finalProduct = filenameMatch.product;
                    matchMethod = `Filename fallback (${(filenameMatch.score * 100).toFixed(0)}%)`;
                    console.log(`   📝 Using filename fallback: ${finalProduct.name}`);
                }

                // Rate limiting for AI calls
                await sleep(CONFIG.apiDelay);
            }

            if (!finalProduct) {
                await moveToReview(imagePath, filename, 'Could not identify product');
                reviewNeeded++;
            } else {
                console.log(`\n✅ MATCHED: ${finalProduct.name}`);
                console.log(`   Method: ${matchMethod}`);

                const processedBuffer = await processImage(imagePath);
                const outputFilename = `product-${finalProduct.id}.webp`;
                const outputPath = path.join(CONFIG.outputDir, outputFilename);

                await fs.writeFile(outputPath, processedBuffer);
                console.log(`📸 Saved: ${outputFilename}`);

                const relativePath = await updateProductsFile(finalProduct.id, productsData.rawContent);
                console.log(`📝 Updated products.js: ${relativePath}`);

                productsData = await loadProducts();
                await safeDelete(imagePath);

                matched++;
            }

            processed++;

        } catch (error) {
            console.error(`❌ Error processing ${filename}:`, error.message);
            await moveToReview(imagePath, filename, `Error: ${error.message}`);
            reviewNeeded++;
        }
    }

    console.log('\n');
    console.log('====================================================');
    console.log('📊 Summary');
    console.log('====================================================');
    console.log(`Total processed:      ${processed}`);
    console.log(`Successfully matched: ${matched}`);
    console.log(`Needs review:         ${reviewNeeded}`);

    if (reviewNeeded > 0) {
        console.log('');
        console.log(`⚠️ ${reviewNeeded} image(s) need manual review in:`);
        console.log(`   ${CONFIG.reviewDir}`);
    }

    console.log('');
}

main().catch(console.error);
