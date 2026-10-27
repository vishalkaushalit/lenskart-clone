import mongoose from 'mongoose';
import { nextOrderId } from '../services/orderIds.js';
import { recordOrderStatus } from '../services/orderTracking.js';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      immutable: true,
      unique: true,
      sparse: true,
      min: 1,
      validate: Number.isSafeInteger,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestId: { type: String },
    shipping: { type: Object },
    billing: { type: Object },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    subtotal: { type: Number, min: 0 },
    discount: { type: Number, min: 0, default: 0 },
    couponCode: { type: String, default: '' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
        options: { color: String, size: String, type: { type: String } },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    deliveredAt: { type: Date, default: null },
    trackingNumber: { type: String, trim: true, maxlength: 100, default: '' },
    carrier: { type: String, trim: true, maxlength: 100, default: '' },
    shipmentBookedAt: { type: Date, default: null },
    carrierCollectedAt: { type: Date, default: null },
    statusHistory: {
      type: [
        {
          status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            required: true,
          },
          at: { type: Date, required: true },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

orderSchema.index(
  { user: 1, requestId: 1 },
  { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } },
);
orderSchema.index({ user: 1, createdAt: -1, _id: -1 });

orderSchema.index({ createdAt: -1, _id: -1 });
orderSchema.index({ status: 1, createdAt: -1, _id: -1 });
orderSchema.index(
  { trackingNumber: 1 },
  {
    name: 'trackingNumber_unique',
    unique: true,
    partialFilterExpression: { trackingNumber: { $type: 'string', $gt: '' } },
    collation: { locale: 'en', strength: 2 },
  },
);

orderSchema.pre('save', async function () {
  if (this.isNew && !this.$locals.orderIdAssigned) {
    this.orderId = await nextOrderId(this.$session());
    this.$locals.orderIdAssigned = true;
  }
});
orderSchema.pre('save', function () {
  recordOrderStatus(this);
});
export default mongoose.model('Order', orderSchema);
