import mongoose from 'mongoose';
const image = value => typeof value === 'string' && value.length <= 2000 && (/^\/assets\/products\/[\w.-]+$/.test(value) || /^https?:\/\/[^\s]+$/.test(value));
const schema = new mongoose.Schema({
  // Parent product; combinations are unique within this product.
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, immutable: true, index: true },
  size: { type: String, enum: ['XS', 'S', 'M', 'M/L', 'L', 'XL'], required: true },
  color: { type: String, trim: true, required: true, maxlength: 50 },
  // Null inherits the current parent price. Stock belongs to this combination.
  price: { type: Number, default: null, min: 0, max: 1000000 },
  // Optional comparison price for the crossed-out price and discount display.
  originalPrice: { type: Number, default: null, min: 0, max: 1000000, validate: { validator: function(value) { return value == null || this.price == null || value >= this.price; }, message: 'Compare price cannot be below price.' } },
  stock: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  // Ordered gallery; first image is the variant cover. Empty inherits product images.
  images: { type: [String], default: [], validate: values => values.length <= 8 && values.every(image) },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
schema.index({ productId: 1, size: 1, color: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
export default mongoose.model('ProductVariant', schema);
