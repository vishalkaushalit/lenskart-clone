import 'dotenv/config';
import mongoose from 'mongoose';
import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { put, head, BlobNotFoundError } from '@vercel/blob';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import ProductVariant from '../src/models/ProductVariant.js';
import { blobStorageConfigured, imageExtension } from '../src/services/productImages.js';

const apply = process.argv.includes('--apply');
const directory = new URL('../public/products/', import.meta.url);
const reportDirectory = new URL('../../output/blob-migration/', import.meta.url);
const reportFile = new URL('catalog.json', reportDirectory);
const models = [Category, Product, ProductVariant];
const prefix = '/assets/products/';
const updates = [];
const files = new Map();
const fieldNames = ['image', 'images', 'tryOnImage', 'highlightImages'];
const collect = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(collect) : value && typeof value === 'object' ? Object.values(value).flatMap(collect) : [];
const replace = (value, links) => typeof value === 'string' ? links[value] || value : Array.isArray(value) ? value.map(item => replace(item, links)) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item, links)])) : value;
let report = { createdAt: new Date().toISOString(), links: {}, records: [], status: 'planned' };
try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  if (apply && !blobStorageConfigured()) throw new Error('Blob storage credentials are required.');
  // Validate all source files and references before uploading or updating records.
  for (const filename of (await readdir(directory)).sort()) {
    if (!/\.(?:webp|png|jpe?g)$/i.test(filename)) continue;
    const buffer = await readFile(new URL(filename, directory));
    const extension = imageExtension(buffer);
    if (!extension) throw new Error(`Invalid image: ${filename}`);
    const digest = createHash('sha256').update(buffer).digest('hex');
    const basename = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
    files.set(prefix + filename, { buffer, extension, pathname: `products/catalog/${basename}-${digest}.${extension}` });
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, autoIndex: false });
  const categories = await Category.find().lean();
  const rowsByModel = [categories, await Product.find().lean(), await ProductVariant.find().lean()];
  for (const [index, rows] of rowsByModel.entries()) for (const row of rows) {
    const before = Object.fromEntries(fieldNames.filter(key => Object.hasOwn(row, key)).map(key => [key, row[key]]));
    for (const image of collect(before).filter(value => value.startsWith(prefix))) {
      if (files.has(image)) continue;
      // Recover known shape categories only; never guess a product or variant photo.
      const root = categories.find(category => String(category._id) === String(row.parent));
      const type = root?.name?.toLowerCase();
      const shape = row.name?.toLowerCase().replaceAll(' ', '');
      const recovery = index === 0 && row.kind === 'shape' && ['eyeglasses', 'sunglasses'].includes(type) ? files.get(`${prefix}${type}-${shape}.webp`) : null;
      if (!recovery) throw new Error(`Missing image ${image} in ${models[index].modelName} ${row._id}. Restore it before migrating.`);
      files.set(image, recovery);
      console.log(`Recovering ${root.name} / ${row.name} from ${type}-${shape}.webp`);
    }
    if (collect(before).some(value => value.startsWith(prefix))) updates.push({ index, id: String(row._id), before });
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', imageLinks: files.size, uniqueUploads: new Set([...files.values()].map(file => file.pathname)).size, recordsToUpdate: updates.length }));
  if (!apply) process.exitCode = 0;
  else {
    await mkdir(reportDirectory, { recursive: true });
    try { report = JSON.parse(await readFile(reportFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    // Keep the original record values for recovery, also across retries.
    for (const update of updates) if (!report.records.some(record => record.model === models[update.index].modelName && record.id === update.id)) report.records.push({ model: models[update.index].modelName, id: update.id, before: update.before });
    report.status = 'uploading';
    await writeFile(reportFile, JSON.stringify(report, null, 2) + '\n');
    const uploaded = new Map();
    let count = 0;
    for (const [local, file] of files) {
      let url = uploaded.get(file.pathname);
      if (!url) {
        try { url = (await head(file.pathname)).url; }
        catch (error) {
          if (!(error instanceof BlobNotFoundError)) throw error;
          url = (await put(file.pathname, file.buffer, { access: 'public', addRandomSuffix: false, allowOverwrite: false, contentType: `image/${file.extension === 'jpg' ? 'jpeg' : file.extension}` })).url;
        }
        uploaded.set(file.pathname, url);
      }
      report.links[local] = url;
      await writeFile(reportFile, JSON.stringify(report, null, 2) + '\n');
      if (++count % 10 === 0) console.log(`Uploaded/verified ${count}/${files.size} image links`);
    }
    report.status = 'updating-database';
    await writeFile(reportFile, JSON.stringify(report, null, 2) + '\n');
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const update of updates) {
          const after = replace(update.before, report.links);
          const result = await models[update.index].collection.updateOne({ _id: new mongoose.Types.ObjectId(update.id), ...update.before }, { $set: after }, { session });
          if (result.matchedCount !== 1) throw new Error(`Record changed during migration: ${models[update.index].modelName} ${update.id}. Retry after reviewing changes.`);
        }
      });
    } finally { await session.endSession(); }
    report.status = 'complete';
    report.completedAt = new Date().toISOString();
    await writeFile(reportFile, JSON.stringify(report, null, 2) + '\n');
    console.log(`Migration complete: ${uploaded.size} Blob images; ${updates.length} catalog records linked. Report: ${fileURLToPath(reportFile)}`);
  }
} catch (error) {
  console.error('Migration failed:', error.name, error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, '[database URI hidden]'));
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
