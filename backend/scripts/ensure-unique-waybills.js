import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../src/models/Order.js';

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: false,
    serverSelectionTimeoutMS: 10000,
  });
  const orders = await Order.find({ trackingNumber: { $type: 'string', $gt: '' } })
    .select('_id orderId trackingNumber')
    .lean();
  const seen = new Map();
  const duplicates = [];
  for (const order of orders) {
    const key = order.trackingNumber.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) duplicates.push([seen.get(key).orderId, order.orderId]);
    else seen.set(key, order);
  }
  if (duplicates.length) {
    console.log(JSON.stringify({ duplicateOrderNumbers: duplicates }));
    throw new Error(
      'Resolve duplicate waybills before creating the unique index. No records were changed.',
    );
  }
  const updates = orders
    .filter((order) => order.trackingNumber !== order.trackingNumber.trim())
    .map((order) => ({
      updateOne: {
        filter: { _id: order._id, trackingNumber: order.trackingNumber },
        update: { $set: { trackingNumber: order.trackingNumber.trim() } },
      },
    }));
  if (updates.length) await Order.collection.bulkWrite(updates);
  const [keys, options] = Order.schema
    .indexes()
    .find(([, options]) => options.name === 'trackingNumber_unique');
  await Order.collection.createIndex(keys, options);
  console.log(
    JSON.stringify({
      checkedWaybills: orders.length,
      trimmedWaybills: updates.length,
      uniqueIndex: 'trackingNumber_unique',
    }),
  );
} finally {
  await mongoose.disconnect();
}
