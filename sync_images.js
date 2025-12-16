#!/usr/bin/env node
/**
 * 🖼️ Pandit Ji Paneer Wale - Smart Image Sync Tool
 * 
 * This script uses Google Gemini AI to automatically detect products in images
 * and match them to your product database.
 * 
 * WORKFLOW:
 * 1. Drop images into: uploads/incoming/
 * 2. Run: node sync_images.js
 * 3. Script will:
 *    - Analyze each image using Gemini AI
 *    - Match it to a product in products.js
 *    - Move it to public/images/products/
 *    - Update products.js with the correct image path
 * 4. Unmatched images go to: uploads/unmatched/
 * 
 * SETUP:
 * 1. Get a free Gemini API key from: https://makersuite.google.com/app/apikey
 * 2. Create a .env file with: GEMINI_API_KEY=your_key_here
 * 3. Run: npm install
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  INCOMING_DIR: path.join(__dirname, 'images', 'incoming'),
  PROCESSED_DIR: path.join(__dirname, 'images', 'processed'),
  UNMATCHED_DIR: path.join(__dirname, 'images', 'unmatched'),
  PRODUCTS_DIR: path.join(__dirname, 'public', 'images', 'products'),
  PRODUCTS_FILE: path.join(__dirname, 'src', 'data', 'products.js'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  // Rate limiting
  API_DELAY_MS: parseInt(process.env.GEMINI_DELAY_MS) || 2000, // 2 second delay between calls
  MAX_RETRIES: 3,
  RETRY_BACKOFF_MS: 5000, // Start with 5 seconds, doubles each retry
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Helper functions for colored output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  step: (num, msg) => console.log(`${colors.magenta}[${num}]${colors.reset} ${msg}`),
};

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Ensure directories exist
function ensureDirectories() {
  [CONFIG.INCOMING_DIR, CONFIG.PROCESSED_DIR, CONFIG.UNMATCHED_DIR, CONFIG.PRODUCTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Load products from products.js
function loadProducts() {
  const content = fs.readFileSync(CONFIG.PRODUCTS_FILE, 'utf-8');

  // Extract the products array using regex
  const productsMatch = content.match(/export\s+const\s+products\s*=\s*(\[[\s\S]*?\]);?\s*$/m);
  if (!productsMatch) {
    throw new Error('Could not find products array in products.js');
  }

  // Parse the products array (eval is safe here as we control the file)
  const productsCode = productsMatch[1];
  const products = eval(productsCode);

  return products;
}

// Get list of images in incoming folder
function getIncomingImages() {
  if (!fs.existsSync(CONFIG.INCOMING_DIR)) {
    return [];
  }

  return fs.readdirSync(CONFIG.INCOMING_DIR)
    .filter(file => CONFIG.SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase()))
    .map(file => path.join(CONFIG.INCOMING_DIR, file));
}

// Convert image to base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

// Get MIME type from extension
function getMimeType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

// Call Gemini API to analyze image
async function analyzeImageWithGemini(imagePath, products) {
  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    log.error('GEMINI_API_KEY not found in environment variables!');
    log.info('Get a free API key from: https://makersuite.google.com/app/apikey');
    log.info('Then create a .env file with: GEMINI_API_KEY=your_key_here');
    return null;
  }

  // Dynamically import the Gemini SDK
  let GoogleGenerativeAI;
  try {
    const module = await import('@google/generative-ai');
    GoogleGenerativeAI = module.GoogleGenerativeAI;
  } catch (e) {
    log.error('Google Generative AI package not found!');
    log.info('Run: npm install @google/generative-ai');
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  log.info(`Using model: ${modelName}`);

  // Prepare product list for the prompt
  const productList = products.map(p => `- ID ${p.id}: "${p.name}" (${p.category})`).join('\n');

  const prompt = `You are a product image classifier for an Indian grocery store. Analyze this product image and identify which product it matches from the list below.

PRODUCT LIST:
${productList}

INSTRUCTIONS:
1. Look at the packaging, brand name, product type, and any text visible
2. Find the BEST matching product from the list above
3. If you're confident about a match (>70% sure), return the product ID
4. If unsure or no good match, return -1

Respond ONLY with a JSON object in this exact format:
{
  "productId": <number or -1>,
  "confidence": <0-100>,
  "detectedBrand": "<brand name or null>",
  "detectedProduct": "<what you see in the image>",
  "reasoning": "<brief explanation>"
}`;

  try {
    const imageBase64 = imageToBase64(imagePath);
    const mimeType = getMimeType(imagePath);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    log.error(`Gemini API error: ${error.message}`);
    return null;
  }
}

// Generate a safe filename from product name
function generateFilename(productName, extension) {
  return productName
    .replace(/[^a-zA-Z0-9\s\(\)]/g, '')
    .replace(/\s+/g, ' ')
    .trim() + extension;
}

// Update products.js with new image path
function updateProductImage(productId, imagePath) {
  let content = fs.readFileSync(CONFIG.PRODUCTS_FILE, 'utf-8');

  // Find the product and update its image
  const imageFilename = path.basename(imagePath);
  const newImagePath = `/images/products/${imageFilename}`;

  // Use regex to find and replace the image for this specific product
  // Match the product block by ID and replace its image
  const productRegex = new RegExp(
    `(\\{[^}]*id:\\s*${productId}[^}]*image:\\s*")[^"]*(")`
    , 'g');

  const updatedContent = content.replace(productRegex, `$1${newImagePath}$2`);

  if (updatedContent !== content) {
    fs.writeFileSync(CONFIG.PRODUCTS_FILE, updatedContent, 'utf-8');
    return true;
  }
  return false;
}

// Move file to destination
function moveFile(source, destDir, newFilename = null) {
  const filename = newFilename || path.basename(source);
  const destination = path.join(destDir, filename);

  // If file already exists, add a timestamp
  let finalDest = destination;
  if (fs.existsSync(destination)) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    finalDest = path.join(destDir, `${base}_${Date.now()}${ext}`);
  }

  fs.copyFileSync(source, finalDest);
  fs.unlinkSync(source);

  return finalDest;
}

// Main sync function
async function syncImages() {
  log.header('🖼️  Pandit Ji Paneer Wale - Smart Image Sync');

  // Load environment variables
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    // dotenv not installed, try to read .env manually
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }
  }

  // Ensure directories exist
  ensureDirectories();

  // Get incoming images
  const images = getIncomingImages();

  if (images.length === 0) {
    log.warning('No images found in uploads/incoming/');
    log.info('Drop your product images there and run this script again.');
    return;
  }

  log.info(`Found ${images.length} image(s) to process`);

  // Load products
  let products;
  try {
    products = loadProducts();
    log.info(`Loaded ${products.length} products from database`);
  } catch (error) {
    log.error(`Failed to load products: ${error.message}`);
    return;
  }

  console.log(''); // Empty line for readability

  // Process each image
  const results = {
    matched: [],
    unmatched: [],
    errors: [],
  };

  for (let i = 0; i < images.length; i++) {
    const imagePath = images[i];
    const filename = path.basename(imagePath);

    log.step(i + 1, `Analyzing: ${filename} (${i + 1}/${images.length})`);

    // Rate limiting: wait before API call (except for first image)
    if (i > 0) {
      log.info(`  Waiting ${CONFIG.API_DELAY_MS / 1000}s before next API call...`);
      await sleep(CONFIG.API_DELAY_MS);
    }

    // Analyze with Gemini
    const analysis = await analyzeImageWithGemini(imagePath, products);

    if (!analysis) {
      results.errors.push({ filename, error: 'API error' });
      log.error(`  Could not analyze image`);
      continue;
    }

    console.log(`  ${colors.cyan}Detected:${colors.reset} ${analysis.detectedProduct}`);
    console.log(`  ${colors.cyan}Brand:${colors.reset} ${analysis.detectedBrand || 'Unknown'}`);
    console.log(`  ${colors.cyan}Confidence:${colors.reset} ${analysis.confidence}%`);
    console.log(`  ${colors.cyan}Reasoning:${colors.reset} ${analysis.reasoning}`);

    if (analysis.productId > 0 && analysis.confidence >= 70) {
      // Find the matched product
      const matchedProduct = products.find(p => p.id === analysis.productId);

      if (matchedProduct) {
        log.success(`  Matched: "${matchedProduct.name}" (ID: ${matchedProduct.id})`);

        // Generate new filename
        const ext = path.extname(filename);
        const newFilename = generateFilename(matchedProduct.name, ext);

        // Move to products directory
        const newPath = moveFile(imagePath, CONFIG.PRODUCTS_DIR, newFilename);

        // Update products.js
        const updated = updateProductImage(matchedProduct.id, newPath);

        if (updated) {
          log.success(`  Updated products.js with new image path`);
        }

        results.matched.push({
          filename,
          product: matchedProduct.name,
          productId: matchedProduct.id,
          confidence: analysis.confidence,
        });
      } else {
        log.warning(`  Product ID ${analysis.productId} not found in database`);
        moveFile(imagePath, CONFIG.UNMATCHED_DIR);
        results.unmatched.push({ filename, reason: 'Product ID not found' });
      }
    } else {
      log.warning(`  No confident match found (confidence: ${analysis.confidence}%)`);
      moveFile(imagePath, CONFIG.UNMATCHED_DIR);
      results.unmatched.push({
        filename,
        detected: analysis.detectedProduct,
        reason: analysis.reasoning,
      });
    }

    console.log(''); // Empty line between images
  }

  // Print summary
  log.header('📊 Summary');
  console.log(`  ${colors.green}✓ Matched:${colors.reset}   ${results.matched.length}`);
  console.log(`  ${colors.yellow}⚠ Unmatched:${colors.reset} ${results.unmatched.length}`);
  console.log(`  ${colors.red}✗ Errors:${colors.reset}    ${results.errors.length}`);

  if (results.matched.length > 0) {
    console.log(`\n${colors.bright}Matched Products:${colors.reset}`);
    results.matched.forEach(m => {
      console.log(`  • ${m.product} (${m.confidence}% confidence)`);
    });
  }

  if (results.unmatched.length > 0) {
    console.log(`\n${colors.bright}Unmatched Images (moved to uploads/unmatched/):${colors.reset}`);
    results.unmatched.forEach(u => {
      console.log(`  • ${u.filename}: ${u.detected || u.reason}`);
    });
  }

  console.log('');
  log.info('Done! Run "npm run dev" to preview your changes.');
}

// Run the script
syncImages().catch(console.error);
