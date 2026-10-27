import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import { demoOrderHistory } from '../src/services/demoOrderHistory.js';
const write = process.argv.includes('--write');
try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: false,
    serverSelectionTimeoutMS: 10000,
  });
  const orders = await Order.find().sort({ createdAt: 1, _id: 1 }).lean();
  let planned = 0;
  let updated = 0;
  const skipped = [];
  for (const [index, order] of orders.entries()) {
    let fields;
    try {
      fields = demoOrderHistory(order, index);
    } catch (error) {
      skipped.push({ orderId: order.orderId, reason: error.message });
      continue;
    }
    if (!Object.keys(fields).length) continue;
    planned++;
    if (write) {
      const result = await Order.updateOne(
        {
          _id: order._id,
          status: order.status,
          updatedAt: order.updatedAt,
          statusHistory: Object.hasOwn(order, 'statusHistory')
            ? order.statusHistory
            : { $exists: false },
          carrier: order.carrier ?? { $exists: false },
        },
        { $set: fields },
        { timestamps: false, runValidators: true },
      );
      updated += result.modifiedCount;
    }
  }
  console.log(
    JSON.stringify({
      mode: write ? 'write' : 'dry-run',
      orders: orders.length,
      planned,
      updated,
      skipped,
    }),
  );
} finally {
  await mongoose.disconnect();
}
