import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsFilePath = path.join(__dirname, 'src', 'data', 'products.js');
const sourceImagesDir = path.join(__dirname, 'imafes folder 2');
const targetImagesDir = path.join(__dirname, 'public', 'images', 'products');
const checklistFilePath = path.join(__dirname, 'IMAGE_CHECKLIST.md');

// Ensure target directory exists
if (!fs.existsSync(targetImagesDir)) {
    fs.mkdirSync(targetImagesDir, { recursive: true });
}

// Read products.js
let productsContent = fs.readFileSync(productsFilePath, 'utf8');

// Read source images
let sourceImages = [];
if (fs.existsSync(sourceImagesDir)) {
    sourceImages = fs.readdirSync(sourceImagesDir);
}

// Also include images already in target dir
let targetImages = [];
if (fs.existsSync(targetImagesDir)) {
    targetImages = fs.readdirSync(targetImagesDir);
}

// Combine and deduplicate
const allImages = [...new Set([...sourceImages, ...targetImages])];

// Use allImages instead of sourceImages

let updatedCount = 0;
let missingImages = [];
let matchedImages = [];

// Regex to find products
// This regex looks for name: "..." and captures the name, then looks for image: "..."
const productRegex = /name:\s*"([^"]+)",[\s\S]*?image:\s*"([^"]+)"/g;

let match;
let newContent = productsContent;

// We need to iterate and replace. Since strings are immutable, we'll build a list of replacements.
// Actually, let's do a replace with a callback function.

newContent = productsContent.replace(/(\{[\s\S]*?name:\s*"([^"]+)"[\s\S]*?image:\s*")([^"]+)("[\s\S]*?\})/g, (fullMatch, start, productName, oldImage, end) => {
    // Normalize product name: remove size info in parentheses, trim, lowercase
    const normalizedProductName = productName.replace(/\s*\([^)]*\)\s*/g, '').trim().toLowerCase();
    
    // Find a matching image
    const imageFile = allImages.find(file => {
        const nameWithoutExt = path.parse(file).name.replace(/\s*\([^)]*\)\s*/g, '').trim().toLowerCase();
        // Check if normalized names match or if one contains the other (for partial matches)
        return nameWithoutExt === normalizedProductName || 
               normalizedProductName.includes(nameWithoutExt) || 
               nameWithoutExt.includes(normalizedProductName);
    });

    if (imageFile) {
        const sourcePath = path.join(sourceImagesDir, imageFile);
        const targetPath = path.join(targetImagesDir, imageFile);
        
        // Copy from source if exists, else assume it's already in target
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
        }
        
        updatedCount++;
        matchedImages.push(productName);
        return `${start}/images/products/${imageFile}${end}`;
    } else {
        missingImages.push(productName);
        return fullMatch; // No change
    }
});

fs.writeFileSync(productsFilePath, newContent, 'utf8');

// Generate Checklist
let checklistContent = `# Product Image Checklist

**Total Products:** ${matchedImages.length + missingImages.length}
**Images Found & Updated:** ${updatedCount}
**Images Missing:** ${missingImages.length}

## ✅ Completed (Images Added)
${matchedImages.map(name => `- [x] ${name}`).join('\n')}

## ❌ Pending (Missing Images)
To add an image:
1. Save the image as \`Product Name.png\` (or .jpg)
2. Place it in \`public/images/products/\`
3. Update \`src/data/products.js\` manually OR run the update script again.

${missingImages.map(name => `- [ ] ${name}`).join('\n')}
`;

fs.writeFileSync(checklistFilePath, checklistContent, 'utf8');

console.log(`Updated ${updatedCount} products. Checklist generated at ${checklistFilePath}`);
