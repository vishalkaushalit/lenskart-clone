import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
const products = [
  ['Lenskart Hustlr Classic', "/assets/products/square.webp", 'Square', 'Lenskart', 1500, 'Classic', 'Black', 'M', 'Unisex'],
  ['Lenskart Air POP', "/assets/products/rectangle.webp", 'Rectangle', 'Lenskart', 1500, 'Classic', 'Black', 'M', 'Unisex'],
  ['John Jacobs Icons Slim', "/assets/products/geometric.webp", 'Geometric', 'John Jacobs', 3000, 'Premium', 'Grey', 'M', 'Unisex'],
  ['Lenskart Air Round', "/assets/products/round.webp", 'Round', 'Lenskart', 1500, 'Classic', 'Gold', 'S', 'Women'],
  ['John Jacobs Aviator', "/assets/products/aviator.webp", 'Aviator', 'John Jacobs', 3000, 'Premium', 'Gold', 'L', 'Men'],
  ['Lenskart Cat Eye', "/assets/products/cateye.webp", 'Cat Eye', 'Lenskart', 1800, 'Classic', 'Pink', 'S', 'Women'],
  ['John Jacobs Clubmaster', "/assets/products/clubmaster.webp", 'Clubmaster', 'John Jacobs', 3000, 'Premium', 'Black', 'L', 'Men'],
  ['Lenskart Everyday Square', "/assets/products/square.webp", 'Square', 'Lenskart', 1200, 'Classic', 'Brown', 'M', 'Unisex'],
  ['John Jacobs Modern Round', "/assets/products/round.webp", 'Round', 'John Jacobs', 3600, 'Premium', 'Grey', 'M', 'Unisex'],
].map(([name, image, shape, brand, price, category, color, size, gender], index) => ({
  sku: `frame-${index + 1}`, stock: 100, status: "active", productType: "Eyeglasses", name, image, shape, brand, price, category, color, size, gender,
  sales: [540, 810, 390, 650, 280, 460, 320, 720, 180][index], addedAt: Date.UTC(2026, 8, index + 1),
  originalPrice: Math.round(price / .75), rating: 4.8, powered: index === 0,
}));

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await Product.init();
  const result = await Product.bulkWrite(products.map((product) => ({ updateOne: { filter: { sku: product.sku }, update: { $setOnInsert: product }, upsert: true } })));
  console.log(JSON.stringify({ inserted: result.upsertedCount, existing: result.matchedCount }));
} finally { await mongoose.disconnect(); }
