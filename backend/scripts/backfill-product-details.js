import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
const defaults = { subtitle: '', lensTypes: [], availableColors: [], availableSizes: [], offerTitle: '', offerText: '', deliveryInformation: '', assurances: [], material: '', hinge: '', temple: '', nosepad: '' };
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  let updated = 0;
  for (const [key,value] of Object.entries(defaults)) {
    const result = await Product.updateMany({ [key]: { $exists: false } }, { $set: { [key]: value } });
    updated += result.modifiedCount;
  }
  console.log(JSON.stringify({ fieldUpdates: updated }));
} finally { await mongoose.disconnect(); }
