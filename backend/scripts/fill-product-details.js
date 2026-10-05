import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const product = await Product.findOne({ sku: 'frame-1' });
  if (!product) throw new Error('Sample product frame-1 was not found.');
  const discount = product.originalPrice > product.price ? Math.round((1-product.price/product.originalPrice)*100) : 0;
  Object.assign(product, {
    subtitle: `${product.color} ${product.shape} Frame`,
    description: `${product.name} pairs a ${product.color.toLowerCase()} finish with a ${product.shape.toLowerCase()} silhouette. This ${product.gender.toLowerCase()} frame is listed in size ${product.size}. Compare the size with your current glasses before ordering.`,
    features: [`${product.shape} frame shape`, `${product.color} finish`, `Size ${product.size}`, `Designed for ${product.gender.toLowerCase()} wear`],
    lensTypes: [product.powered ? 'Powered Eyeglasses' : product.productType],
    availableColors: [product.color], availableSizes: [product.size],
    offerTitle: discount ? 'Current Price Offer' : '',
    offerText: discount ? `Save ${discount}% compared with the listed original price. Current frame price: ₹${product.price.toLocaleString('en-IN')}.` : '',
    deliveryInformation: 'Delivery availability and charges must be confirmed before placing your order. Contact the store for details for your location.',
    assurances: [],
    material: 'Keep the frame clean with a soft cloth. Material composition has not been specified.', hinge: 'Open and close the arms gently. Avoid forcing the hinges beyond their natural range.', temple: 'Check that the arms sit comfortably behind your ears when choosing your frame size.', nosepad: 'Check that the bridge rests comfortably on your nose without slipping or pinching.',
  });
  await product.save();
  console.log(JSON.stringify({ updated: product.name, id: String(product._id) }));
} finally { await mongoose.disconnect(); }
