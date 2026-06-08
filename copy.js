import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const artifactsDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\98007d68-2d06-4841-872b-aac6d7f9de67';
const outputDir = path.join(process.cwd(), 'public/images/products');

const filesToConvert = [
    { src: 'everest_kasuri_methi_natural_1780568067320.png', dest: 'everest-kasuri-methi.webp' }
];

async function convertAndCopy() {
    for (const file of filesToConvert) {
        const inputPath = path.join(artifactsDir, file.src);
        const outputPath = path.join(outputDir, file.dest);
        
        try {
            await sharp(inputPath)
                .webp({ quality: 90 })
                .toFile(outputPath);
            console.log(`Successfully converted and copied ${file.dest}`);
        } catch (err) {
            console.error(`Error processing ${file.src}:`, err);
        }
    }
    console.log("All done!");
}

convertAndCopy();
