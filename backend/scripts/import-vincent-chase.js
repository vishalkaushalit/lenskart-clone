import 'dotenv/config';
import mongoose from 'mongoose';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import Product from '../src/models/Product.js';
import ProductVariant from '../src/models/ProductVariant.js';
import { imageExtension } from '../src/services/productImages.js';

// Snapshot of VC E16002's linked color options. Source lists XL only.
// Inventory is deliberately zero: another retailer's availability is not ours.
const entries = JSON.parse(await readFile(new URL('./vincent-chase-e16002.json', import.meta.url), 'utf8'));
const directory = new URL('../public/products/', import.meta.url);
const run = promisify(execFile);
let tryOnImage = '/assets/products/vincent-chase-e16002-try-on.png';
try { tryOnImage = JSON.parse(await readFile(new URL('./vincent-chase-e16002-try-on.json', import.meta.url), 'utf8')).asset || tryOnImage; } catch (error) { if (error.code !== 'ENOENT') throw error; }
const sku = 'vc-e16002';
await mkdir(directory, { recursive: true });
if (!process.argv.includes('--apply')) {
  for (const entry of entries) {
    for (const [index, source] of entry.images.entries()) {
      const { stdout } = await run('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '60', source], { encoding: 'buffer', maxBuffer: 15 * 1024 * 1024 });
      if (imageExtension(stdout) !== 'jpg') throw new Error(`Invalid source photo: ${source}`);
      await writeFile(new URL(`vc-e16002-${entry.sourceId}-${index + 1}.jpg`, directory), stdout);
    }
    console.log(`Prepared ${entry.color}: ${entry.images.length} images, ${entry.size}`);
  }
} else {
  if (imageExtension(await readFile(new URL('vincent-chase-e16002-try-on.png', directory))) !== 'png') throw new Error('Prepare the transparent front-view try-on PNG before applying.');
  const galleries = entries.map(entry => entry.images.map((_, index) => `/assets/products/vc-e16002-${entry.sourceId}-${index + 1}.jpg`));
  for (const images of galleries) for (const image of images) {
    if (!imageExtension(await readFile(new URL(image.replace('/assets/products/', ''), directory)))) throw new Error(`Invalid image ${image}`);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    const session = await mongoose.startSession();
    let product;
    try {
      await session.withTransaction(async () => {
        product = await Product.findOne({ sku }).session(session);
        if (!product) {
          product = new Product({ sku, name: 'Vincent Chase Metal Edition', slug: 'vincent-chase-metal-edition-vc-e16002', brand: 'Vincent Chase', productType: 'Eyeglasses', shape: 'Square', gender: 'Unisex', color: entries[0].color, size: 'XL', price: 1500, originalPrice: 2000, stock: 0, hasVariants: true, image: galleries[0][0], images: galleries[0], tryOnImage, availableSizes: ['XL'], availableColors: entries.map(entry => entry.color), material: 'Stainless Steel', temple: 'Stainless Steel', subtitle: 'VC E16002 · Full rim square metal frame', description: 'Full rim square stainless steel eyeglasses. Extra Wide (XL), 144 mm frame width; frame dimensions 55-16-145.', features: ['Full rim square frame', 'Stainless steel construction', 'Extra Wide (XL)', 'Frame dimensions: 55-16-145'] });
          await product.save({ session });
        } else {
          product.tryOnImage = tryOnImage;
          await product.save({ session });
        }
        for (const [index, entry] of entries.entries()) {
          let variant = await ProductVariant.findOne({ productId: product._id, color: entry.color, size: entry.size }).session(session);
          if (!variant) variant = new ProductVariant({ productId: product._id, color: entry.color, size: entry.size, price: entry.price, originalPrice: entry.originalPrice, stock: 0 });
          variant.images = galleries[index];
          // Reuse the selected Black / Gold asset, including a subsequently imported GLB.
          if (index === 0) variant.tryOnImage = tryOnImage;
          await variant.save({ session });
        }
      });
    } finally { await session.endSession(); }
    const variants = await ProductVariant.find({ productId: product._id }).lean();
    console.log(JSON.stringify({ slug: product.slug, variants: variants.map(({ color, size, images, tryOnImage }) => ({ color, size, images: images.length, tryOn: Boolean(tryOnImage) })) }));
  } finally { await mongoose.disconnect(); }
}
