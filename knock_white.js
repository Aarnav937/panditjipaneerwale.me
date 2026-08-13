/**
 * Flood-fill near-white studio backdrop from the image edges.
 * Leaves white that sits inside the pack (not connected to the border).
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = path.resolve('public/images/products');
const outDir = path.resolve('public/images/packs');
fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp') || f.endsWith('.jpg'));

const isBackdrop = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const white = max >= 228 && max - min <= 28;
  const black = max <= 26;
  return white || black;
};

async function knock(file) {
  const input = path.join(dir, file);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const stack = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const o = i * 4;
    if (!isBackdrop(data[o], data[o + 1], data[o + 2])) return;
    visited[i] = 1;
    stack.push(i);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length) {
    const i = stack.pop();
    const x = i % width;
    const y = (i - x) / width;
    const o = i * 4;
    const whiteness = (data[o] + data[o + 1] + data[o + 2]) / 3;
    data[o + 3] = whiteness > 248 ? 0 : Math.max(0, Math.round((255 - whiteness) * 6));
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  const dest = path.join(outDir, file.replace(/\.jpg$/i, '.webp'));
  await sharp(data, { raw: { width, height, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 85 })
    .toFile(dest);
}

let n = 0;
let failed = 0;
for (const file of files) {
  try {
    await knock(file);
    n += 1;
    if (n % 20 === 0) console.log(`knocked ${n}/${files.length}`);
  } catch (err) {
    failed += 1;
    console.warn('skip', file, err.message);
  }
}
console.log(`done ${n} images, ${failed} skipped`);
