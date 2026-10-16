import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  moderatedAt: { type: Date, default: null },
}, { timestamps: true });
schema.index({ order: 1, product: 1 }, { unique: true });
schema.index({ product: 1, status: 1, createdAt: -1 });
schema.index({ status: 1, createdAt: -1, _id: -1 });
export default mongoose.model('CustomerReview', schema);
