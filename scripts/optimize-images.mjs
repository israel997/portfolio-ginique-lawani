// Recompresses every raster image under public/ in place, so URLs (including
// the ones stored in the database) never change.
//
//   npm run images:optimize
//
// - Caps the long edge at MAX_EDGE px (more is wasted on any screen we serve)
// - Re-encodes as progressive mozjpeg JPEG (PNGs saved as .jpg become real JPEGs)
// - Only overwrites when the result is meaningfully smaller, so re-running the
//   script doesn't keep degrading images that are already optimized
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const MAX_EDGE = 1800;
const QUALITY = 78;
const MIN_GAIN = 0.05; // keep the original unless we save at least 5%

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jpe?g|png)$/i.test(entry.name)) yield full;
  }
}

let before = 0;
let after = 0;

for (const file of walk(root)) {
  const original = readFileSync(file);
  const isPng = /\.png$/i.test(file);
  let pipeline = sharp(original).rotate().resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true
  });
  pipeline = isPng
    ? pipeline.png({ compressionLevel: 9, palette: true, quality: 90 })
    : pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: QUALITY, mozjpeg: true, progressive: true });

  const optimized = await pipeline.toBuffer();
  const rel = path.relative(root, file);
  before += original.length;

  if (optimized.length < original.length * (1 - MIN_GAIN)) {
    writeFileSync(file, optimized);
    after += optimized.length;
    console.log(`${rel.padEnd(36)} ${kb(original.length)} -> ${kb(optimized.length)}`);
  } else {
    after += original.length;
    console.log(`${rel.padEnd(36)} ${kb(original.length)} (already optimal)`);
  }
}

console.log(`\nTotal: ${kb(before)} -> ${kb(after)} (-${Math.round((1 - after / before) * 100)}%)`);

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`.padStart(8);
}
