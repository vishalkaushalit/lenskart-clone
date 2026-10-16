import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';
import CustomerReview from '../src/models/CustomerReview.js';
import { canReview } from '../src/controllers/reviewController.js';

const write = process.argv.includes('--write');
const samples = [
  [5, 'Comfortable frames for everyday wear. I like the fit and the finish.'],
  [4, 'The frame looks good and feels light. A nice choice for daily use.'],
  [5, 'Happy with the design and the overall comfort of these glasses.'],
];
try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  if (write) await CustomerReview.init();
  const now = new Date();
  const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const orders = await Order.find({ status: 'delivered', $or: [
    { deliveredAt: { $lte: cutoff } },
    { deliveredAt: null, updatedAt: { $lte: cutoff } },
  ] }).populate('user', 'name role status').sort({ deliveredAt: -1, updatedAt: -1 }).lean();
  const admin = await User.findOne({ role: 'admin', status: 'active' }).select('_id').lean();
  let eligible = 0;
  let added = 0;
  const seen = new Set();
  for (const order of orders) {
    if (!order.user || order.user.role !== 'customer' || order.user.status !== 'active') continue;
    for (const item of order.items) {
      const productId = String(item.product || '');
      const identity = `${order._id}:${productId}`;
      if (seen.has(identity) || !canReview(order, productId, now)) continue;
      seen.add(identity);
      if (!await Product.exists({ _id: item.product, status: 'active' })) continue;
      if (await CustomerReview.exists({ order: order._id, product: item.product })) continue;
      const [rating, text] = samples[eligible % samples.length];
      eligible++;
      if (write) {
        if (!admin) throw new Error('An active admin is required to approve demo reviews.');
        const result = await CustomerReview.updateOne({ order: order._id, product: item.product }, { $setOnInsert: {
          user: order.user._id, order: order._id, product: item.product, name: order.user.name,
          rating, text, status: 'approved', moderatedBy: admin._id, moderatedAt: now,
        } }, { upsert: true, runValidators: true });
        added += result.upsertedCount;
      }
      if (eligible >= 12) break;
    }
    if (eligible >= 12) break;
  }
  console.log(JSON.stringify({ mode: write ? 'write' : 'dry-run', eligibleOrderProducts: eligible, addedReviews: added, approvalAdminAvailable: Boolean(admin) }));
} finally { await mongoose.disconnect(); }
