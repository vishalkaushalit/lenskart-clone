import 'dotenv/config';
import mongoose from 'mongoose';
import { mkdir, writeFile } from 'node:fs/promises';
import Product from '../src/models/Product.js';
import { imageExtension } from '../src/services/productImages.js';

const directory = new URL('../public/products/', import.meta.url);
const sources = [
  ['frame-1', 'https://www.lenskart.com/vincent-chase-vc-e17100-c1-eyeglasses.html'],
  ['frame-2', 'https://www.lenskart.com/lenskart-lk-e18244-m-black-eyeglass.html'],
  ['frame-3', 'https://www.lenskart.com/vincent-chase-vc-e13787-c2-eyeglasses.html?productId=146622'],
  ['frame-4', 'https://www.lenskart.com/lenskart-lk-e15180-c1-eyeglasses.html'],
  ['frame-5', 'https://www.lenskart.com/john-jacobs-jj-e70142-c1-eyeglasses.html'],
  ['frame-6', 'https://www.lenskart.com/lenskart-air-la-e14101-c2-c2-eyeglasses.html'],
  ['frame-7', 'https://www.lenskart.com/john-jacobs-jj-e70199-c1-eyeglasses.html'],
  ['frame-8', 'https://www.lenskart.com/lenskart-studio-lke000419-c1-eyeglasses.html'],
  ['frame-9', 'https://www.lenskart.com/lenskart-lk-e15180-c1-eyeglasses.html'],
];
async function request(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${url}`);
  return response;
}

// Download and validate every gallery before changing any database records.
await mkdir(directory, { recursive: true });
const manifest = [];
for (const [sku, page] of sources) {
  const html = await (await request(page)).text();
  const urls = [...new Set([...html.matchAll(/<img\b[^>]*alt="Product \d+"[^>]*>/g)].map(([tag]) => tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&')).filter(Boolean))].slice(0, 4);
  if (urls.length < 3) throw new Error(`Not enough product photos on ${page}`);
  const images = [];
  for (const [index, url] of urls.entries()) {
    const buffer = Buffer.from(await (await request(url)).arrayBuffer());
    const extension = imageExtension(buffer);
    if (!extension) throw new Error(`Invalid image: ${url}`);
    const filename = `sample-${sku}-${index + 1}.${extension}`;
    await writeFile(new URL(filename, directory), buffer);
    images.push({ local: `/assets/products/${filename}`, source: url });
  }
  manifest.push({ sku, page, images });
  console.log(`Downloaded ${sku}: ${images.length} photos`);
}
await writeFile(new URL('sample-image-sources.json', directory), JSON.stringify(manifest, null, 2) + '\n');
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  let updated = 0;
  for (const { sku, images } of manifest) {
    const product = await Product.findOne({ sku });
    if (!product) continue;
    const gallery = images.map(image => image.local);
    // Replace only the seeded demo gallery, preserving any user-uploaded photos.
    const uploads = product.images.filter(image => !/^\/assets\/products\/(?:sample-|dummy-)/.test(image) && image !== product.image);
    product.image = gallery[0];
    product.images = [...new Set([...gallery, ...uploads])].slice(0, 8);
    const details = { material: gallery[0], hinge: gallery[1], temple: gallery[2], nosepad: gallery[3] || gallery[0] };
    for (const [key, value] of Object.entries(details)) {
      if (!product.highlightImages[key] || /^\/assets\/products\/(?:sample-|dummy-|square\.webp)/.test(product.highlightImages[key])) product.highlightImages[key] = value;
    }
    await product.save();
    updated++;
  }
  console.log(JSON.stringify({ updatedProducts: updated, downloadedImages: manifest.reduce((count, entry) => count + entry.images.length, 0) }));
} finally {
  await mongoose.disconnect();
}
