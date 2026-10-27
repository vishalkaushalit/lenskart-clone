import 'dotenv/config';
import mongoose from 'mongoose';
import { createHash } from 'node:crypto';
import Product from '../src/models/Product.js';

// Guest samples are separate from verified, moderated customer submissions.
const samples = [
  ['Aarav', 5, 'Comfortable for daily wear. The frame feels light and sits well.'],
  ['Meera', 4, 'The shape looks good and the finish is neat.'],
  ['Rohan', 5, 'A simple style that works well for everyday use.'],
  ['Ananya', 4, 'I like the frame design. A useful option for work and reading.'],
  ['Kabir', 3, 'Nice design, though I would prefer a slightly wider fit.'],
  ['Isha', 5, 'The frame feels comfortable and the color is easy to match.'],
  ['Neha', 4, 'Good-looking frames with a clean, understated style.'],
  ['Arjun', 4, 'The size and shape suit me well. Happy with the overall look.'],
];
const write = process.argv.includes('--write');
try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const products = await Product.find({ status: 'active' }).select('_id reviews').lean();
  let added = 0;
  let planned = 0;
  let renamed = 0;
  let plannedRenames = 0;
  let cleaned = 0;
  let plannedCleanups = 0;
  const now = Date.now();
  for (const product of products) {
    // Preserve existing reviews and leave room within the product's 100-review limit.
    let remaining = Math.max(0, 100 - (product.reviews?.length || 0));
    for (const [index, [name, rating, text]] of samples.entries()) {
      const hex = createHash('sha256')
        .update(`sample-review-v1:${product._id}:${index}`)
        .digest('hex')
        .slice(0, 24);
      const _id = new mongoose.Types.ObjectId(hex);
      const existing = product.reviews?.find((review) => String(review._id) === hex);
      if (existing) {
        if (existing.text === `Sample review: ${text}`) {
          plannedCleanups++;
          if (write) {
            const result = await Product.updateOne(
              { _id: product._id, reviews: { $elemMatch: { _id, text: existing.text } } },
              { $set: { 'reviews.$.text': text } },
              { runValidators: true },
            );
            cleaned += result.modifiedCount;
          }
        }
        if (existing.name === `${name} (Guest · sample)`) {
          plannedRenames++;
          if (write) {
            const result = await Product.updateOne(
              { _id: product._id, reviews: { $elemMatch: { _id, name: existing.name } } },
              { $set: { 'reviews.$.name': name } },
              { runValidators: true },
            );
            renamed += result.modifiedCount;
          }
        }
        continue;
      }
      if (!remaining) continue;
      planned++;
      remaining--;
      if (!write) continue;
      const review = { _id, name, rating, text, date: new Date(now - (index + 1) * 86400000) };
      const result = await Product.updateOne(
        {
          _id: product._id,
          'reviews._id': { $ne: _id },
          $expr: { $lt: [{ $size: { $ifNull: ['$reviews', []] } }, 100] },
        },
        { $push: { reviews: review } },
        { runValidators: true },
      );
      added += result.modifiedCount;
    }
  }
  console.log(
    JSON.stringify({
      mode: write ? 'write' : 'dry-run',
      activeProducts: products.length,
      plannedReviews: planned,
      addedReviews: added,
      plannedRenames,
      renamedReviews: renamed,
      plannedCleanups,
      cleanedReviews: cleaned,
    }),
  );
} finally {
  await mongoose.disconnect();
}
