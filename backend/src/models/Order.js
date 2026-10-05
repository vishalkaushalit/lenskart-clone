import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestId: {type:String},
  shipping: {type:Object}, billing: {type:Object},
  paymentMethod: {type:String,enum:["cod","online"],default:"cod"},
  subtotal: {type:Number,min:0},discount: {type:Number,min:0,default:0},couponCode: {type:String,default:""},
  items: [{
    product: {type:mongoose.Schema.Types.ObjectId,ref:"Product"},
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

export default mongoose.model('Order', orderSchema);
