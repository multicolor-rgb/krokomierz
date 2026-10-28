import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(root, '../assets/logo.svg');
const iconsDir = path.resolve(root, 'public/icons');
const publicDir = path.resolve(root, 'public');

await mkdir(iconsDir, { recursive: true });

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-64.png', size: 64 },
];

for (const { name, size } of sizes) {
  await sharp(source).resize(size, size).png().toFile(path.join(iconsDir, name));
}

// Maskowalna ikona: logo na pełnym tle, z bezpiecznym marginesem.
const inner = await sharp(source).resize(400, 400).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#08090B' },
})
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(path.join(iconsDir, 'maskable-512.png'));

await sharp(source).resize(512, 512).png().toFile(path.join(publicDir, 'og-icon.png'));

console.log('Ikony wygenerowane.');
