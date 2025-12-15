#!/usr/bin/env node
/**
 * 🖼️ Interactive Image Preview Tool
 * 
 * Shows what the sync script will do before making changes.
 * Run with: node preview_images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  INCOMING_DIR: path.join(__dirname, 'uploads', 'incoming'),
  UNMATCHED_DIR: path.join(__dirname, 'uploads', 'unmatched'),
  PRODUCTS_DIR: path.join(__dirname, 'public', 'images', 'products'),
  PRODUCTS_FILE: path.join(__dirname, 'src', 'data', 'products.js'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
};

// Load environment
async function loadEnv() {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }
  }
}

// Load products
function loadProducts() {
  const content = fs.readFileSync(CONFIG.PRODUCTS_FILE, 'utf-8');
  const productsMatch = content.match(/export\s+const\s+products\s*=\s*(\[[\s\S]*?\]);?\s*$/m);
  if (!productsMatch) throw new Error('Could not find products array');
  return eval(productsMatch[1]);
}

// Get incoming images
function getIncomingImages() {
  if (!fs.existsSync(CONFIG.INCOMING_DIR)) return [];
  return fs.readdirSync(CONFIG.INCOMING_DIR)
    .filter(file => CONFIG.SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase()))
    .map(file => ({
      path: path.join(CONFIG.INCOMING_DIR, file),
      name: file,
    }));
}

// Get existing product images
function getExistingImages() {
  if (!fs.existsSync(CONFIG.PRODUCTS_DIR)) return [];
  return fs.readdirSync(CONFIG.PRODUCTS_DIR);
}

// Find products with placeholder images
function getPlaceholderProducts(products) {
  return products.filter(p => 
    p.image.includes('placeholder') || 
    p.image.includes('via.placeholder')
  );
}

// Analyze image with Gemini
async function analyzeImage(imagePath, products) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  let GoogleGenerativeAI;
  try {
    const module = await import('@google/generative-ai');
    GoogleGenerativeAI = module.GoogleGenerativeAI;
  } catch (e) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const productList = products.map(p => `- ID ${p.id}: "${p.name}" (${p.category})`).join('\n');

  const prompt = `Analyze this product image and match it to a product from this list:

${productList}

Return ONLY JSON:
{
  "productId": <number or -1>,
  "confidence": <0-100>,
  "detectedBrand": "<brand or null>",
  "detectedProduct": "<description>",
  "reasoning": "<brief explanation>"
}`;

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBuffer.toString('base64'), mimeType: mimeTypes[ext] || 'image/jpeg' } }
    ]);

    let jsonStr = result.response.text();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    return null;
  }
}

// Create readline interface
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Ask a question
function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// Main preview function
async function previewImages() {
  await loadEnv();
  
  console.log(`
${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║          🖼️  IMAGE SYNC - INTERACTIVE PREVIEW                ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    console.log(`${colors.red}❌ No Gemini API key found!${colors.reset}`);
    console.log(`\n${colors.yellow}To set up:${colors.reset}`);
    console.log(`1. Get a free API key: ${colors.cyan}https://makersuite.google.com/app/apikey${colors.reset}`);
    console.log(`2. Add it to ${colors.green}.env${colors.reset} file: ${colors.dim}GEMINI_API_KEY=your_key${colors.reset}`);
    return;
  }

  // Load products
  let products;
  try {
    products = loadProducts();
  } catch (e) {
    console.log(`${colors.red}❌ Failed to load products: ${e.message}${colors.reset}`);
    return;
  }

  // Show current status
  const placeholderProducts = getPlaceholderProducts(products);
  const existingImages = getExistingImages();
  const incomingImages = getIncomingImages();

  console.log(`${colors.bright}📊 CURRENT STATUS${colors.reset}`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`  Total products:         ${colors.cyan}${products.length}${colors.reset}`);
  console.log(`  With placeholder image: ${colors.yellow}${placeholderProducts.length}${colors.reset}`);
  console.log(`  With real image:        ${colors.green}${products.length - placeholderProducts.length}${colors.reset}`);
  console.log(`  Existing images:        ${colors.blue}${existingImages.length}${colors.reset}`);
  console.log(`  Images to process:      ${colors.magenta}${incomingImages.length}${colors.reset}`);
  console.log('');

  if (incomingImages.length === 0) {
    console.log(`${colors.yellow}📁 No images found in uploads/incoming/${colors.reset}`);
    console.log(`\n${colors.dim}Drop your product images there and run this script again.${colors.reset}`);
    
    // Show products that need images
    if (placeholderProducts.length > 0) {
      console.log(`\n${colors.bright}📋 PRODUCTS NEEDING IMAGES:${colors.reset}`);
      console.log(`${'─'.repeat(50)}`);
      
      // Group by category
      const byCategory = {};
      placeholderProducts.forEach(p => {
        if (!byCategory[p.category]) byCategory[p.category] = [];
        byCategory[p.category].push(p);
      });
      
      Object.entries(byCategory).forEach(([category, prods]) => {
        console.log(`\n${colors.cyan}${category}${colors.reset} (${prods.length} items)`);
        prods.slice(0, 5).forEach(p => {
          console.log(`  ${colors.dim}•${colors.reset} ${p.name}`);
        });
        if (prods.length > 5) {
          console.log(`  ${colors.dim}... and ${prods.length - 5} more${colors.reset}`);
        }
      });
    }
    return;
  }

  // Process images
  console.log(`${colors.bright}🔍 ANALYZING IMAGES...${colors.reset}`);
  console.log(`${'─'.repeat(50)}\n`);

  const rl = createInterface();
  const results = [];

  for (let i = 0; i < incomingImages.length; i++) {
    const img = incomingImages[i];
    console.log(`${colors.bright}[${i + 1}/${incomingImages.length}]${colors.reset} ${img.name}`);
    
    const analysis = await analyzeImage(img.path, products);
    
    if (!analysis) {
      console.log(`  ${colors.red}Failed to analyze${colors.reset}\n`);
      results.push({ image: img, analysis: null, action: 'skip' });
      continue;
    }

    console.log(`  ${colors.cyan}Detected:${colors.reset} ${analysis.detectedProduct}`);
    console.log(`  ${colors.cyan}Brand:${colors.reset} ${analysis.detectedBrand || 'Unknown'}`);
    console.log(`  ${colors.cyan}Confidence:${colors.reset} ${analysis.confidence}%`);

    if (analysis.productId > 0 && analysis.confidence >= 70) {
      const matchedProduct = products.find(p => p.id === analysis.productId);
      if (matchedProduct) {
        console.log(`  ${colors.green}✓ Match:${colors.reset} "${matchedProduct.name}"`);
        results.push({ 
          image: img, 
          analysis, 
          product: matchedProduct, 
          action: 'match' 
        });
      } else {
        console.log(`  ${colors.yellow}⚠ Product ID not found${colors.reset}`);
        results.push({ image: img, analysis, action: 'unmatched' });
      }
    } else {
      console.log(`  ${colors.yellow}⚠ No confident match${colors.reset}`);
      results.push({ image: img, analysis, action: 'unmatched' });
    }
    console.log('');
  }

  // Show summary
  const matched = results.filter(r => r.action === 'match');
  const unmatched = results.filter(r => r.action === 'unmatched' || r.action === 'skip');

  console.log(`${colors.bright}📊 PREVIEW SUMMARY${colors.reset}`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`  ${colors.green}Will match:${colors.reset}    ${matched.length} images`);
  console.log(`  ${colors.yellow}Unmatched:${colors.reset}     ${unmatched.length} images`);
  console.log('');

  if (matched.length > 0) {
    console.log(`${colors.bright}✓ WILL BE APPLIED:${colors.reset}`);
    matched.forEach(r => {
      console.log(`  ${r.image.name} → ${colors.green}${r.product.name}${colors.reset}`);
    });
    console.log('');
  }

  if (unmatched.length > 0) {
    console.log(`${colors.bright}⚠ WILL MOVE TO UNMATCHED:${colors.reset}`);
    unmatched.forEach(r => {
      console.log(`  ${r.image.name} ${colors.dim}(${r.analysis?.detectedProduct || 'analysis failed'})${colors.reset}`);
    });
    console.log('');
  }

  // Ask to proceed
  if (matched.length > 0) {
    const answer = await ask(rl, `\n${colors.bright}Apply these changes? (y/n):${colors.reset} `);
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log(`\n${colors.cyan}Running sync script...${colors.reset}\n`);
      rl.close();
      
      // Import and run the main sync script
      const { spawn } = await import('child_process');
      spawn('node', ['sync_images.js'], { 
        stdio: 'inherit',
        cwd: __dirname
      });
    } else {
      console.log(`\n${colors.yellow}Cancelled. No changes made.${colors.reset}`);
      rl.close();
    }
  } else {
    rl.close();
  }
}

previewImages().catch(console.error);
