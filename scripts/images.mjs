/**
 * Keeps personal metadata (EXIF, GPS, camera model, XMP, comments...) out of committed images.
 *
 *   node scripts/images.mjs check            fail if any image in src/ or public/ has metadata
 *   node scripts/images.mjs strip            strip metadata from every image in src/ and public/
 *   node scripts/images.mjs strip --staged   strip staged images and re-stage them (pre-commit hook)
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const IMAGE = /\.(jpe?g|png|webp|avif|gif|tiff?|heic|heif)$/i;
const FOLDERS = ['src', 'public'];
const LOSSY = new Set(['jpeg', 'webp', 'avif']);
const WRITABLE = new Set([...LOSSY, 'png', 'gif', 'tiff']);

async function imagesInFolders() {
  const found = [];
  for (const folder of FOLDERS.filter((f) => existsSync(f))) {
    const entries = await readdir(folder, { recursive: true });
    found.push(...entries.filter((e) => IMAGE.test(e)).map((e) => path.join(folder, e)));
  }
  return found;
}

function stagedImages() {
  const out = execFileSync('git', ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR']);
  return out
    .toString()
    .split('\0')
    .filter((f) => IMAGE.test(f));
}

/** Names of the metadata blocks found in an image, e.g. ['exif', 'xmp']. */
async function metadataIn(file) {
  const meta = await sharp(file)
    .metadata()
    .catch(() => ({ format: 'an unreadable format' }));
  if (!WRITABLE.has(meta.format)) {
    throw new Error(`${file}: ${meta.format} can't be cleaned, convert it to JPEG or PNG first`);
  }
  const blocks = ['exif', 'xmp', 'iptc', 'icc'].filter((key) => meta[key]);
  if (meta.comments?.length) blocks.push('comments');
  return blocks;
}

async function strip(file) {
  const meta = await sharp(file).metadata();
  const options = LOSSY.has(meta.format) ? { quality: 90 } : {};
  // rotate() bakes the EXIF orientation into the pixels before the EXIF is dropped.
  const clean = await sharp(file).rotate().toFormat(meta.format, options).toBuffer();
  await writeFile(file, clean);
}

async function check() {
  let dirty = 0;
  for (const file of await imagesInFolders()) {
    const blocks = await metadataIn(file);
    if (blocks.length === 0) continue;
    dirty++;
    console.error(`✗ ${file} has metadata: ${blocks.join(', ')}`);
  }
  if (dirty > 0) {
    console.error('\nRun `npm run images:strip` to clean them.');
    process.exit(1);
  }
  console.log('✓ images carry no metadata');
}

async function stripAll(files, { restage }) {
  for (const file of files) {
    const blocks = await metadataIn(file);
    if (blocks.length === 0) continue;
    await strip(file);
    if (restage) execFileSync('git', ['add', '--', file]);
    console.log(`✓ stripped ${blocks.join(', ')} from ${file}`);
  }
}

const [command, flag] = process.argv.slice(2);
try {
  if (command === 'check') await check();
  else if (command === 'strip' && flag === '--staged')
    await stripAll(stagedImages(), { restage: true });
  else if (command === 'strip') await stripAll(await imagesInFolders(), { restage: false });
  else throw new Error('usage: node scripts/images.mjs check | strip [--staged]');
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
