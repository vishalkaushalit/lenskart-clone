import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  code:{type:String,required:true,unique:true,trim:true,uppercase:true,match:/^[A-Z0-9_-]{2,40}$/},
  type:{type:String,enum:['percentage','fixed'],required:true},
  value:{type:Number,required:true,min:0.01,max:1000000},
  minimum:{type:Number,min:0,max:1000000,default:0},
  expiresAt:{type:Date,default:null},
  active:{type:Boolean,default:true},
},{timestamps:true});
schema.pre('validate',function(){if(this.type==='percentage'&&this.value>100)this.invalidate('value','Percentage must not exceed 100.');});
export default mongoose.model('Coupon',schema);
