import mongoose from 'mongoose';
import {nextOrderId} from '../services/orderIds.js';

const orderSchema = new mongoose.Schema({
  orderId:{type:Number,immutable:true,unique:true,sparse:true,min:1,validate:Number.isSafeInteger},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestId: {type:String},
  shipping: {type:Object}, billing: {type:Object},
  paymentMethod: {type:String,enum:["cod","online"],default:"cod"},
  subtotal: {type:Number,min:0},discount: {type:Number,min:0,default:0},couponCode: {type:String,default:""},
  items: [{
    product: {type:mongoose.Schema.Types.ObjectId,ref:"Product"},
    variant: {type:mongoose.Schema.Types.ObjectId,ref:"ProductVariant",default:null},
    options: {color:String,size:String,type:{type:String}},
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

orderSchema.index({user:1,requestId:1},{unique:true,partialFilterExpression:{requestId:{$type:'string'}}});
orderSchema.index({ user: 1, createdAt: -1, _id: -1 });

orderSchema.index({ createdAt: -1, _id: -1 });
orderSchema.index({ status: 1, createdAt: -1, _id: -1 });

orderSchema.pre('save',async function(){if(this.isNew&&!this.$locals.orderIdAssigned){this.orderId=await nextOrderId(this.$session());this.$locals.orderIdAssigned=true;}});
export default mongoose.model('Order', orderSchema);
