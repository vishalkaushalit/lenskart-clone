import ProductVariant from '../models/ProductVariant.js';
import User from '../models/User.js';
import { searchTerms, textSearch } from '../services/search.js';
import express from 'express';
import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
export const commerceAdmin=express.Router();
commerceAdmin.use(requireAuth,requireRole('admin'));
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(error=>{
  if(error.code===11000)return res.status(409).json({message:'This coupon code already exists.'});
  if(['ValidationError','CastError'].includes(error.name))return res.status(400).json({message:'Check the supplied fields.'});
  if(error.status)return res.status(error.status).json({message:error.message});
  next(error);
});
function fail(message,status=400){throw Object.assign(new Error(message),{status});}
function id(value){if(!/^[a-f\d]{24}$/i.test(value||''))fail('Invalid ID.');return value;}
function pagination(req){const page=Number(req.query.page||1);if(!Number.isSafeInteger(page)||page<1||page>10000)fail('Invalid page.');return {page,limit:20};}
commerceAdmin.get('/coupons',wrap(async(req,res)=>{const {page,limit}=pagination(req);const filter=textSearch(searchTerms(req.query.search),['code','type']);const [total,coupons]=await Promise.all([Coupon.countDocuments(filter),Coupon.find(filter).sort({createdAt:-1,_id:-1}).skip((page-1)*limit).limit(limit).lean()]);res.json({coupons,total,page});}));
function couponFields(body){const fields={};for(const key of ['code','type','value','minimum','expiresAt','active'])if(Object.hasOwn(body||{},key))fields[key]=body[key];return fields;}
commerceAdmin.get('/coupons/:id',wrap(async(req,res)=>{const coupon=await Coupon.findById(id(req.params.id)).lean();if(!coupon)fail('Coupon not found.',404);res.json({coupon});}));
commerceAdmin.post('/coupons',wrap(async(req,res)=>{const coupon=await Coupon.create(couponFields(req.body));res.status(201).json({coupon});}));
commerceAdmin.patch('/coupons/:id',wrap(async(req,res)=>{const coupon=await Coupon.findById(id(req.params.id));if(!coupon)fail('Coupon not found.',404);Object.assign(coupon,couponFields(req.body));await coupon.save();res.json({coupon});}));
commerceAdmin.get('/orders',wrap(async(req,res)=>{const {page,limit}=pagination(req);const terms=searchTerms(req.query.search);const filter={};
  if(terms.length){
    filter.$and=await Promise.all(terms.map(async term=>{
      const users=await User.find(textSearch([term],['name','email','phone'])).select('_id').lean();
      const alternatives=['shipping.name','shipping.email','shipping.phone','items.name','couponCode','status','paymentMethod'].map(field=>({[field]:{$regex:term,$options:'i'}}));
      if(users.length)alternatives.push({user:{$in:users.map(user=>user._id)}});
      const number=term.replace(/^#/, '');
      if(/^[0-9]+$/.test(number)&&Number.isSafeInteger(Number(number)))alternatives.push({orderId:Number(number)});
      if(/^[a-f\d]{24}$/i.test(term))alternatives.push({_id:term});
      return {$or:alternatives};
    }));
  }
  if(req.query.status){if(!['pending','confirmed','shipped','delivered','cancelled'].includes(req.query.status))fail('Invalid order status.');filter.status=req.query.status;}const [total,orders]=await Promise.all([Order.countDocuments(filter),Order.find(filter).populate('user','name email').sort({createdAt:-1,_id:-1}).skip((page-1)*limit).limit(limit).lean()]);res.json({orders,total,page});}));
commerceAdmin.get('/orders/:id',wrap(async(req,res)=>{const order=await Order.findById(id(req.params.id)).populate('user','name email').lean();if(!order)fail('Order not found.',404);res.json({order});}));
commerceAdmin.patch('/orders/:id',wrap(async(req,res)=>{
  if(!['pending','confirmed','shipped','delivered','cancelled'].includes(req.body?.status))fail('Invalid order status.');
  const orderId=id(req.params.id);const session=await mongoose.startSession();let order;
  try{await session.withTransaction(async()=>{
    order=await Order.findById(orderId).session(session);if(!order)fail('Order not found.',404);
    if(order.status===req.body.status)return;
    if(order.status==='cancelled'||order.status==='delivered')fail('Completed or cancelled orders cannot be changed.');
    const sequence=['pending','confirmed','shipped','delivered'];if(req.body.status!=='cancelled'&&sequence.indexOf(req.body.status)<sequence.indexOf(order.status))fail('An order cannot move to an earlier status.');
    if(req.body.status==='cancelled')for(const item of order.items)if(item.product){if(item.variant){await ProductVariant.updateOne({_id:item.variant,productId:item.product},{$inc:{stock:item.quantity}},{session});await Product.updateOne({_id:item.product},{$inc:{sales:-item.quantity}},{session});}else await Product.updateOne({_id:item.product},{$inc:{stock:item.quantity,sales:-item.quantity}},{session});}
    order.status=req.body.status;await order.save({session});
  });}finally{await session.endSession();}res.json({order});
}));

export const commercePublic=express.Router();
export function discountAmount(coupon,total){return Math.min(total,Math.round((coupon.type==='percentage'?total*coupon.value/100:coupon.value)*100)/100);}
export async function quote(items,code,session){
  if(!Array.isArray(items)||!items.length||items.length>100)fail('Choose between 1 and 100 products.');
  const ids=new Set();const lines=[];
  for (const item of items) {
    id(item.id);
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) fail('Check the cart quantities.');
    let query = Product.findOne({ _id: item.id, status: 'active' }); if (session) query = query.session(session);
    const product = await query;
    if (!product) fail('A product is unavailable.', 409);
    const options = item.options || {};
    if (typeof options !== 'object' || Array.isArray(options) || ['color','size','type'].some(key=>options[key]!==undefined&&(typeof options[key]!=='string'||options[key].length>100))) fail('Invalid product selection.');
    let variant = null;
    if (product.hasVariants) {
      let lookup = ProductVariant.findOne({ productId: product._id, color: options.color, size: options.size, status: 'active' }).collation({ locale: 'en', strength: 2 });
      if (session) lookup = lookup.session(session);
      variant = await lookup;
      if (!variant || item.variantId && String(variant._id)!==item.variantId) fail('The selected size and color variant is unavailable.', 409);
    }
    const identity = variant ? `${item.id}:${variant._id}` : item.id;
    if (ids.has(identity)) fail('Check the cart quantities.');
    ids.add(identity);
    const stock = variant ? variant.stock : product.stock;
    if (item.quantity > stock) fail('A product is unavailable or has insufficient stock.', 409);
    const colors = [product.color, ...(product.availableColors || [])];
    const sizes = [product.size, ...(product.availableSizes || [])];
    if ((!variant && (options.color && !colors.includes(options.color) || options.size && !sizes.includes(options.size))) || options.type && !['Powered Eyeglass', 'Zero Power', 'Reading Glasses', 'Sunglass'].includes(options.type)) fail('Invalid product selection.');
    lines.push({ product: product._id, ...(variant ? { variant: variant._id } : {}), name: product.name, quantity: item.quantity, unitPrice: variant?.price ?? product.price, options: { color: variant?.color || options.color || product.color, size: variant?.size || options.size || product.size, type: options.type || product.productType } });
  }
  const subtotal=Math.round(lines.reduce((sum,item)=>sum+item.unitPrice*item.quantity,0)*100)/100;let discount=0;let couponCode='';let percentage=null;
  if(code){if(typeof code!=='string'||! /^[A-Z0-9_-]{2,40}$/.test(code.trim().toUpperCase()))fail('Invalid coupon code.');let query=Coupon.findOne({code:code.trim().toUpperCase(),active:true});if(session)query=query.session(session);const coupon=await query;if(!coupon||coupon.expiresAt&&coupon.expiresAt<=new Date())fail('Coupon is invalid or expired.');if(subtotal<coupon.minimum)fail(`Minimum purchase for this coupon is ₹${coupon.minimum}.`);discount=discountAmount(coupon,subtotal);couponCode=coupon.code;percentage=coupon.type==='percentage'?coupon.value:null;}
  return {items:lines,subtotal,discount,couponCode,percentage,total:Math.round((subtotal-discount)*100)/100};
}
commercePublic.post('/coupons/validate',wrap(async(req,res)=>{if(!req.body?.code)fail('Enter a coupon code.');const result=await quote(req.body.items,req.body.code);res.json({code:result.couponCode,percentage:result.percentage,discount:result.discount,subtotal:result.subtotal,total:result.total});}));
export function address(value){if(!value||typeof value!=='object')fail('Enter an address.');const result={};for(const key of ['name','phone','email','address','city','state','pincode']){if(typeof value[key]!=='string'||!value[key].trim()||value[key].length>300)fail('Complete the address fields.');result[key]=value[key].trim();}if(!/^[1-9][0-9]{5}$/.test(result.pincode)||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)||! /^[+]?[0-9 ()-]{10,20}$/.test(result.phone))fail('Check the email, phone and pincode.');result.landmark=typeof value.landmark==='string'?value.landmark.slice(0,300):'';return result;}
commercePublic.post('/orders',requireAuth,wrap(async(req,res)=>{
  if(req.body?.paymentMethod!=='cod')fail('Online payment is not connected yet. Choose COD.');
  const shipping=address(req.body.shipping);const billing=address(req.body.billing||req.body.shipping);
  if(typeof req.body.requestId!=='string'||!/^[\w-]{10,100}$/.test(req.body.requestId))fail('Invalid order request.');
  const session=await mongoose.startSession();let order;
  try{await session.withTransaction(async()=>{order=await Order.findOne({user:req.user._id,requestId:req.body.requestId}).session(session);if(order)return;const result=await quote(req.body.items,req.body.couponCode,session);for(const item of result.items){if(item.variant){const changed=await ProductVariant.updateOne({_id:item.variant,productId:item.product,status:'active',stock:{$gte:item.quantity}},{$inc:{stock:-item.quantity}},{session});if(changed.modifiedCount!==1)fail('Variant stock changed. Update your cart.',409);await Product.updateOne({_id:item.product},{$inc:{sales:item.quantity}},{session});}else{const changed=await Product.updateOne({_id:item.product,status:'active',stock:{$gte:item.quantity}},{$inc:{stock:-item.quantity,sales:item.quantity}},{session});if(changed.modifiedCount!==1)fail('Stock changed. Update your cart.',409);}} [order]=await Order.create([{user:req.user._id,requestId:req.body.requestId,items:result.items,totalAmount:result.total,subtotal:result.subtotal,discount:result.discount,couponCode:result.couponCode,shipping,billing,paymentMethod:'cod',status:'confirmed'}],{session});});}finally{await session.endSession();}
  res.status(201).json({success:true,order});
}));

// Scope order receipts to the signed-in customer, including after a page refresh.
commercePublic.get('/orders/:id',requireAuth,wrap(async(req,res)=>{
  const order=await Order.findOne({_id:id(req.params.id),user:req.user._id}).lean();
  if(!order)fail('Order not found.',404);
  res.json({order});
}));
