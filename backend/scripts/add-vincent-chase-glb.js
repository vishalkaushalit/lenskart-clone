import 'dotenv/config';
import mongoose from 'mongoose';
import { put } from '@vercel/blob';
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import Product from '../src/models/Product.js';
import ProductVariant from '../src/models/ProductVariant.js';
import { inspectGlb } from '../../shared/tryOnAsset.js';
import { blobStorageConfigured } from '../src/services/productImages.js';

const source = 'https://lookr-static.lenskart.com/frameassets/210628/mweb/sku_210628.glb';
const filename = new URL('../public/products/vincent-chase-e16002-black-gold.glb', import.meta.url);
const manifestPath = new URL('./vincent-chase-e16002-try-on.json', import.meta.url);
const { stdout } = await promisify(execFile)('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '60', source], { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 });
const model = inspectGlb(stdout);
await writeFile(filename, stdout);
let previous;
try { previous = JSON.parse(await readFile(manifestPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
let asset = previous?.asset || '/assets/products/vincent-chase-e16002-black-gold.glb';
if (blobStorageConfigured() && !/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(asset)) {
  const blob = await put('products/vincent-chase-e16002-black-gold.glb', stdout, { access: 'public', contentType: 'model/gltf-binary', addRandomSuffix: true });
  asset = blob.url;
}
await writeFile(manifestPath, JSON.stringify({ source, sourceProductId: '210628', color: 'Black / Gold', asset, bytes: stdout.length }, null, 2) + '\n');
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const session = await mongoose.startSession();
  let product;
  try {
    await session.withTransaction(async () => {
      product = await Product.findOne({ sku: 'vc-e16002' }).session(session);
      if (!product) throw new Error('Import VC E16002 before assigning its GLB.');
      const variants = await ProductVariant.find({ productId: product._id, color: 'Black / Gold' }).session(session);
      if (!variants.length) throw new Error('The Black / Gold variants are missing.');
      product.tryOnImage = asset;
      await product.save({ session });
      for (const variant of variants) { variant.tryOnImage = asset; await variant.save({ session }); }
    });
  } finally { await session.endSession(); }
  const saved = await Product.findById(product._id).lean();
  const variants = await ProductVariant.find({ productId: product._id, color: 'Black / Gold' }).lean();
  if (saved.tryOnImage !== asset || variants.some(row => row.tryOnImage !== asset)) throw new Error('GLB assignment verification failed.');
  console.log(JSON.stringify({ slug: saved.slug, asset, bytes: stdout.length, meshes: model.meshes.length, updatedVariants: variants.length }));
} finally { await mongoose.disconnect(); }
